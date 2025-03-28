import { creatOrEditVariable } from 'src/services/VariableGroupsService';
import { showWaysMenu } from '../../views/TransversalView';
import { WAYS } from '../ConstantsOptions';
import { Action } from './IAction';
import data from '../../../data.json';

export class VariableAction implements Action {
    private readonly actionHandlers = {
        [WAYS.AUTOMATIC]: async () => this.automaticVaribaleHandle(),
        [WAYS.MANUAL]: async () => this.assistedVariableHandle(),
    };

    async handle(): Promise<string> {
        const selectedAction = await showWaysMenu('¿Como quieres modificar las variables?');
        return await (this.actionHandlers[selectedAction] ?? (() => "exit"))();
    }

    async automaticVaribaleHandle(){
        let repoList:string[] = data.repositories;
        let variables = data.variables;
        if (repoList?.length === 0 && !variables) {
            console.log("No repositories or variables provided.");
            return "exit";
        }
        for (let repoName of repoList) {
            await creatOrEditVariable(repoName, variables);
        }
        return "automatic";
    }

    async assistedVariableHandle(): Promise<string> {
        console.log("Assisted variable modification is not implemented yet.");
        // Implement the logic for assisted variable modification here
        // For now, we will just return "manual" to indicate that this option was selected
        return "manual";
    }
}