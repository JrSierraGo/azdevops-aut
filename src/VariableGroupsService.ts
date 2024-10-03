import { getTaskAgentApi } from './AZDevopsApiService';
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi';
import { PROJECT_NAME, VARIABLE_GROUP_NEMOTECNIC_NAME , ENVIRONMENT_NAME } from "../environment";
import { VariableGroup, VariableValue } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces';

interface IVariable {
    [key: string]: string;
}

export async function creatOrEditVariable(groupName: string, variables: IVariable) : Promise<VariableGroup | null> {
    let taskAgentApi: ITaskAgentApi = await getTaskAgentApi();
    
    let groupNameWithNemotecnic = `${VARIABLE_GROUP_NEMOTECNIC_NAME}${ENVIRONMENT_NAME}${groupName}`;

    try {
        let variableGroups : VariableGroup[] = await taskAgentApi.getVariableGroups(PROJECT_NAME, groupNameWithNemotecnic)
        if (Array.isArray(variableGroups) && variableGroups.length > 0) {
            let variableGroupId:number = variableGroups[0].id ?? 0;
            let variableGroup:VariableGroup = await taskAgentApi.getVariableGroup(PROJECT_NAME, variableGroupId);
            let transformedVariables:{ [key: string]: VariableValue; } = convertVariables(variables);
            variableGroup.variables = { ...variableGroup.variables, ...transformedVariables };
            let variableGroupUpdated = await taskAgentApi.updateVariableGroup(variableGroup, variableGroupId);
            console.log(`${groupNameWithNemotecnic} updated.`);
            return variableGroupUpdated;
        }else{
            console.error(`${groupNameWithNemotecnic} not found.`);
            return null;
        }
        
    } catch (error) {
        let e = error as Error;
        console.error(`Error in createVariable ${groupName}`, e.message);
        return null;
    }
}


function convertVariables(variables: IVariable): { [key: string]: VariableValue; } {
    return Object.keys(variables).reduce((acc, key) => {
        acc[key] = { value: variables[key] };
        return acc;
    }, {} as { [key: string]: { value: string; }; });
}
