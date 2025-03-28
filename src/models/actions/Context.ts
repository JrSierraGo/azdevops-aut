import { Action } from './IAction';

export class Context {
    
    private readonly strategy: Action;

    constructor(strategy: Action) {
        this.strategy = strategy;
    }


    public handle(): void {
        const result = this.strategy.handle();
        console.log(result);

    }
}