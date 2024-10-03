import data from './data.json';
import { SERVICE } from './environment';
import { createPullRequest } from './src/PRService';
import { creatOrEditVariable } from './src/VariableGroupsService';

async function main(){
    let repoList:string[] = data.repositories;
    for (let repoName of repoList){
        switch (SERVICE) {
            case "PR":
                await createPullRequest(repoName);
                break;
            case "VARIABLES":
                await creatOrEditVariable(repoName, data.variables);
                break;
            default:
                console.error("Service not found.");
                break;
        }
    }
}

main();