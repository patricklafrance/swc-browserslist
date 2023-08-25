import browserslist from "browserslist";

export interface BrowserslistToSwcTargetsOptions extends browserslist.Options {
    queries?: string | string[];
}

export function browserslistToSwcTargets(options: BrowserslistToSwcTargetsOptions = {}) {
    const {
        queries,
        ...browserlistsOptions
    } = options;

    // let config = query;

    // if (!config) {
    //     browserslist.loadConfig({
    //         path: path || process.cwd(),
    //         env
    //     });
    // }

    const targets = browserslist(queries, browserlistsOptions);

    console.log("*****************: ", targets);

    // let configOrOptions: string[] | browserslist.Options | undefined = options;

    // if (!options) {
    //     const path = process.cwd();

    //     configOrOptions = browserslist.loadConfig({ path });
    // }

    // const targets = browserslist(null, configOrOptions);
}
