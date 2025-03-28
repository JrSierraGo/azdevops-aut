import { Action } from "./IAction";
import { showManualPullRequestMenu } from "../../views/PullRequestView";
import { showInputData, showWaysMenu } from "../../views/TransversalView";
import { WAYS } from "../ConstantsOptions";
import { createPullRequest, getAllRepositories } from "../../services/PRService";
import data from '../../../data.json';
import { GitRepository } from "azure-devops-node-api/interfaces/GitInterfaces";
import { PR_TITLE, SOURCE_BRANCH, TARGET_BRANCH} from "../../../environment";

export class PRAction implements Action {

    private readonly actionHandlers = {
        [WAYS.AUTOMATIC]: async () => this.automaticPullRequestHandle(),
        [WAYS.MANUAL]: async () => this.assistedPullRequestHandle(),
    };  

    
    async handle(): Promise<string> {
        const selectedAction = await showWaysMenu('¿Como quiere realizar el PR?');
        return await (this.actionHandlers[selectedAction] ?? (() => "exit"))();
    }

    async assistedPullRequestHandle(): Promise<string> {
        const allRepositories:GitRepository[] = await getAllRepositories();
        const data:string[] = allRepositories.map((repo:GitRepository) => repo.name ?? "");
        const selectedRepositories:string[] = await showManualPullRequestMenu(data);
        if (selectedRepositories.length === 0) {
            console.log("No repositories selected.");
            return "exit";
        }
        const workItemInput:string = await showInputData("Enter the work item ID:");
        const workItemId = parseInt(workItemInput);
        const titlePullRequest:string = await showInputData("Ingrese el titulo del PR:");
        const sourceBranch:string = await showInputData("Ingrese el nombre de la rama origen:");
        const targetBranch:string = await showInputData("Ingrese el nombre de la rama destino:");
        for (let repoName of selectedRepositories){
            await createPullRequest(repoName, workItemId, titlePullRequest, sourceBranch, targetBranch);
        }
        return "manual";
    }

    async automaticPullRequestHandle(){
        let repoList:string[] = data.repositories;
        let workItemId:number = data.workItemId;
        if (repoList?.length === 0 && !workItemId) {
            console.log("No repositories or work item ID provided.");
            return "exit";
        }
        for (let repoName of repoList) {
            await createPullRequest(repoName, workItemId, PR_TITLE, SOURCE_BRANCH, TARGET_BRANCH);
        }
        return "automatic";
    }

}