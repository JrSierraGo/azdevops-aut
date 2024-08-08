import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { ResourceRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { GitPullRequest, GitPullRequestSearchCriteria, PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import dotenv from "dotenv";

import data from './data.json';

dotenv.config();
const ORG_URL       : string = process.env.ORGANIZATION_URL ?? "";
const TOKEN         : string = process.env.PERSONAL_ACCESS_TOKEN ?? "";
const PROJECT_NAME  : string = process.env.PROJECT_NAME ?? "";
const PR_TITLE      : string = process.env.TITLE_PR ?? "";
const SOURCE_BRANCH : string = process.env.SOURCE_BRANCH ?? "";
const TARGET_BRANCH : string = process.env.TARGET_BRANCH ?? "";
const REF_BRANCH    : string = "refs/heads/";


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
    let objectPR: GitPullRequest = creteObjectPR(titlePR, sourceBranch, targetBranch, workItems);

   try {
     let pullRequest: GitPullRequest = await git.createPullRequest(objectPR, repoName, PROJECT_NAME);
     console.log(`PR Created ${pullRequest.repository?.webUrl}/pullrequest/${pullRequest.pullRequestId}`);
     return pullRequest;
   } catch (error) {
    let e = error as Error;
    console.error("Error in createPullRequest: ", repoName, e.message);
    return null;
   }
}

async function getLastPRId(git: IGitApi, repoName: string, sourceBranch?: string) : Promise<number> {
    try {

        let searchCriteria: GitPullRequestSearchCriteria = getPRSearchCriteria(sourceBranch, PullRequestStatus.Completed);
        let pr: GitPullRequest[] = await git.getPullRequests(repoName, searchCriteria, PROJECT_NAME, undefined, undefined, 1);

       return (pr && pr.length != 0 && pr[0].pullRequestId)  
            ? pr[0].pullRequestId 
            : NaN;
    } catch (error) {
        let e = error as Error;
        console.error("Error in getLastPRId: ", repoName, e.message);
        return NaN;
    }
}

function creteObjectPR(titlePR?:string, sourceBranch?: string, targetBranch?:string, workItems?: ResourceRef[]) : GitPullRequest {
    return { 
        title: titlePR, 
        sourceRefName: `${REF_BRANCH}${sourceBranch}`,
        targetRefName: `${REF_BRANCH}${targetBranch}`,
        workItemRefs: workItems
    };
}

function getPRSearchCriteria(branch: string | undefined, status: PullRequestStatus): GitPullRequestSearchCriteria {
    return { 
        targetRefName: `${REF_BRANCH}${branch}`, 
        status: status, 
    };
}

async function getWorkItems(git: IGitApi, repoName: string, idPR: number): Promise<ResourceRef[]> {
    try {
        return await git.getPullRequestWorkItemRefs(repoName, idPR, PROJECT_NAME);
    } catch (error) {
        let e = error as Error;
        console.error("Error in getWorkItems: ", repoName, idPR, e.message);
        return [];
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