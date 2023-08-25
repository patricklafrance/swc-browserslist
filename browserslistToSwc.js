// Inspired by https://github.com/marcofugaro/browserslist-to-esbuild/blob/main/src/index.js
// We are doing this because browserslist-rs (which is used under the hood by SWC), doesn't support browserslist extends syntax: https://github.com/browserslist/browserslist-rs#limitations

import browserslist from "browserslist";

// FROM:
//
// ['and_chr 115',   'and_ff 115',   'and_qq 13.1',
// 'and_uc 15.5',   'android 115',  'baidu 13.18',
// 'bb 10',         'bb 7',         'chrome 116',
// 'chrome 115',    'chrome 114',   'chrome 113',
// 'chrome 112',    'chrome 111',   'chrome 110',
// 'chrome 109',    'chrome 108',   'chrome 107',
// 'edge 115',      'edge 114',     'edge 113',
// 'edge 112',      'edge 111',     'edge 110',
// 'edge 109',      'edge 108',     'edge 107',
// 'edge 106',      'firefox 116',  'firefox 115',
// 'firefox 114',   'firefox 113',  'firefox 112',
// 'firefox 111',   'firefox 110',  'firefox 109',
// 'firefox 108',   'firefox 107',  'ie 11',
// 'ie 10',         'ie 9',         'ie 8',
// 'ie 7',          'ie 6',         'ie 5.5',
// 'ie_mob 11',     'ie_mob 10',    'ios_saf 16.5',
// 'ios_saf 16.4',  'ios_saf 16.3', 'ios_saf 16.2',
// 'ios_saf 16.1',  'ios_saf 16.0', 'ios_saf 15.6-15.7',
// 'ios_saf 15.5',  'ios_saf 15.4', 'ios_saf 15.2-15.3',
// 'kaios 3.0-3.1', 'kaios 2.5',    'op_mini all',
// 'op_mob 73',     'opera 101',    'opera 100',
// 'opera 99',      'opera 98',     'opera 97',
// 'opera 96',      'opera 95',     'opera 94',
// 'opera 93',      'opera 92',     'safari 16.5',
// 'safari 16.4',   'safari 16.3',  'safari 16.2',
// 'safari 16.1',   'safari 16.0',  'safari 15.6',
// 'safari 15.5',   'safari 15.4',  'safari 15.2-15.3',
// 'samsung 21',    'samsung 20',   'samsung 19.0',
// 'samsung 18.0',  'samsung 17.0', 'samsung 16.0',
// 'samsung 15.0',  'samsung 14.0', 'samsung 13.0',
// 'samsung 12.0']
//
// -->
//
// TO:
//
// {
//  chrome: '107',
//  firefox: '107',
//  android: '115',
//  edge: '106',
//  ie: '5.5',
//  opera: '73',
//  safari: '15.2',
//  samsung: '12'
// }

// Took the original list from browserslist-rs: https://github.dev/browserslist/browserslist-rs/blob/99a3244fc8c0e631a80a9cae5c41dca6c5a2aae5/build.rs
// And then removed a few browsers that SWC is discarting: https://github.com/swc-project/swc/blob/main/crates/preset_env_base/src/lib.rs#L105
const SupportedSwcTargets = [
    "ie",
    "edge",
    "firefox",
    "chrome",
    "safari",
    "opera",
    "ios_saf",
    "android",
    "op_mob",
    "and_chr",
    "and_ff",
    "ie_mob",
    "samsung"
];

// Took from https://github.com/swc-project/swc/blob/main/crates/preset_env_base/src/lib.rs#L90
const SwcTargetMapping = {
    "and_chr": "chrome",
    "and_ff": "firefox",
    "ie_mob": "ie",
    "ios_saf": "ios",
    "op_mob": "opera"
};

function parseBrowserslistResult(result) {
    // "chrome 11" --> ["chrome", "11"]
    const values = result.split(" ");

    let target = values[0];
    let version = values[1];

    // and_chr --> "chrome"
    if (SwcTargetMapping[target]) {
        target = SwcTargetMapping[target];
    }

    // 11.0-12.0 --> 11.0
    if (version.includes("-")) {
        version = version.slice(0, version.indexOf("-"));
    }

    // 11.0 --> 11
    if (version.endsWith(".0")) {
        version = version.slice(0, -2);
    }

    return {
        target,
        version
    };
}

export function browserslistToSwc(options = {}) {
    console.time("***************** browserslistToSwc");

    const {
        // @ts-ignore
        queries,
        // Will ignore path because it doesn't seem to work anyway
        path,
        ...browserlistsOptions
    } = options;

    const results = browserslist(queries, browserlistsOptions);

    console.log("*****************: ", results);

    const targets = results.reduce((acc, x) => {
        const { target, version } = parseBrowserslistResult(x);

        // Exclude targets that are not supported by SWC
        if (SupportedSwcTargets.indexOf(target) === -1) {
            return acc;
        }

        // Only keep the oldest version
        if (acc[target]) {
            if (parseFloat(acc[target]) > parseFloat(version)) {
                acc[target] = version;
            }
        } else {
            acc[target] = version;
        }

        return acc;
    }, {});


    console.log("*****************: ", targets);

    console.timeEnd("***************** browserslistToSwc");

    return targets;
}
