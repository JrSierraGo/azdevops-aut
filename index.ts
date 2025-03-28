import {showMainMenu} from './src/views/MainView'
import { MAIN_OPTIONS } from './src/models/ConstantsOptions';
import { PRAction } from './src/models/actions/PRAction';
import { Action } from './src/models/actions/IAction';
import { VariableAction } from './src/models/actions/VariableAction';

const resolveStrategy:{[key:string]:Action} = {
        [MAIN_OPTIONS.PULL_REQUEST]: new PRAction(),
        [MAIN_OPTIONS.VARIABLES]: new VariableAction(),
    };

async function main(){
    let selectedAction: string = await showMainMenu();
    const action: Action = resolveStrategy[selectedAction];
    action.handle();
    // let repoList:string[] = data.repositories;
    
    // for (let repoName of repoList){
        
    //     switch (SERVICE) {
    //         case "PR":
    //             await createPullRequest(repoName);
    //             break;
    //         case "VARIABLES":
    //             await creatOrEditVariable(repoName, data.variables);
    //             break;
    //         case "PR_APPROVAL":
    //            await approveAndCompletePR(repoName, data.pullRequestId);
    //            break;
    //         case "CHANGE_FILE":
                // await updateDockerfile(repoName);
    //             break;
    //         default:
    //             console.error("Service not found.");
    //             break;
    //     }
    // }
}

main();