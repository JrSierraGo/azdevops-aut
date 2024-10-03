import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi';
import { TOKEN, ORG_URL } from '../environment';


export async function getGitApi(): Promise<IGitApi> {
    let connection: WebApi = await getConection();
    let git: IGitApi = await connection.getGitApi();
    return git;
}

export async function getTaskAgentApi(): Promise<ITaskAgentApi> {
    let connection: WebApi = await getConection();
    return await connection.getTaskAgentApi();
}

async function getConection(): Promise<WebApi> {
    const authHandler: IRequestHandler = getPersonalAccessTokenHandler(TOKEN);
    const connection: WebApi = new WebApi(ORG_URL, authHandler);
    return connection;
}
