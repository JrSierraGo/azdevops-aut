import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { ResourceRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { GitPullRequest, PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import dotenv from "dotenv";

import data from './data.json';

dotenv.config();
const ORG_URL       : string               = process.env.ORGANIZATION_URL ?? "";
const TOKEN         : string               = process.env.PERSONAL_ACCESS_TOKEN ?? "";
const PROJECT_NAME  : string | undefined   = process.env.PROJECT_NAME;
const PR_TITLE      : string | undefined   = process.env.TITLE_PR;
const SOURCE_BRANCH : string | undefined   = process.env.SOURCE_BRANCH;
const TARGET_BRANCH : string | undefined   = process.env.TARGET_BRANCH;


async function main(){
    let repoList:string[] = data.repositories;
    for (let repoName of repoList){
        await createPullRequest(repoName, SOURCE_BRANCH, TARGET_BRANCH, PR_TITLE);
    }
}

async function createPullRequest(repoName:string, sourceBranch?:string, targetBranch?:string, titlePR?:string) : Promise<GitPullRequest | null> {
    let git: IGitApi = await getGitApi();
    let lastPRId: number = await getLastPRId(git, repoName, sourceBranch);
    let workItems: ResourceRef[] = await getWorkItems(git, repoName, lastPRId);

   try {
     let pullRequest: GitPullRequest = await git.createPullRequest({ title: titlePR, sourceRefName: `refs/heads/${sourceBranch}`, targetRefName: `refs/heads/${targetBranch}`, workItemRefs: workItems}, repoName, PROJECT_NAME);

     console.log(`PR Created ${pullRequest.repository?.webUrl}/pullrequest/${pullRequest.pullRequestId}`);
     return pullRequest;
   } catch (error) {
    let e = error as Error;
    console.error("Error in createPullRequest: ", repoName, e.message);
    return null;
   }
}

async function getLastPRId(git: IGitApi, repoName: string, sourceBranch?: string) {
    try {
        let pr: GitPullRequest[] = await git.getPullRequests(repoName, { targetRefName: `refs/heads/${sourceBranch}`, status: PullRequestStatus.Completed, }, PROJECT_NAME, undefined, undefined, 1);

        let prId: number = NaN;

        if (pr && pr.length != 0) {
            prId = pr[0].pullRequestId ? pr[0].pullRequestId : prId;
        }
        return prId;
    } catch (error) {
        let e = error as Error;
        console.error("Error in getLastPRId: ", repoName, e.message);
        return NaN;
    }
}

async function getWorkItems(git: IGitApi, nameMS: string, idPR: number) {
    try {
        return await git.getPullRequestWorkItemRefs(nameMS, idPR, PROJECT_NAME);
    } catch (error) {
        let e = error as Error;
        console.error("Error in getWorkItems: ", nameMS, idPR, e.message);
        return [];
        //throw new Error("Error al obtener los workItems");   
    }
}

async function getGitApi():Promise<IGitApi> {
    let connection:WebApi = await getConection();
    let git:IGitApi = await connection.getGitApi()
    return git;
}

async function getConection():Promise<WebApi> {
    const authHandler : IRequestHandler = getPersonalAccessTokenHandler(TOKEN); 
    const connection : WebApi = new WebApi(ORG_URL, authHandler);
    return connection;
}

main();