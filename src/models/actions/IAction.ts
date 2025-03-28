export interface Action {
    handle(): Promise<string>;
}