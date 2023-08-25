export interface LoadingProps {
    message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
    return (
        <div className="text-color">{message}</div>
    );
}
