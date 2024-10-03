import { IGitApi } from 'azure-devops-node-api/GitApi';
import { ResourceRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { GitPullRequest, GitPullRequestSearchCriteria, PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { PROJECT_NAME, PR_TITLE, SOURCE_BRANCH, TARGET_BRANCH, REF_BRANCH } from "../environment";
import { getGitApi } from './AZDevopsApiService';


export async function createPullRequest(repoName: string): Promise<GitPullRequest | null> {
    let git: IGitApi = await getGitApi();
    let lastPRId: number = await getLastPRId(git, repoName);
    let workItems: ResourceRef[] = await getWorkItems(git, repoName, lastPRId);
    let objectPR: GitPullRequest = creteObjectPR(workItems);

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

async function getLastPRId(git: IGitApi, repoName: string): Promise<number> {
    try {

        let searchCriteria: GitPullRequestSearchCriteria = getPRSearchCriteria(PullRequestStatus.Completed);
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
function creteObjectPR(workItems?: ResourceRef[]): GitPullRequest {
    return {
        title: PR_TITLE,
        sourceRefName: `${REF_BRANCH}${SOURCE_BRANCH}`,
        targetRefName: `${REF_BRANCH}${TARGET_BRANCH}`,
        workItemRefs: workItems
    };
}
function getPRSearchCriteria(status: PullRequestStatus): GitPullRequestSearchCriteria {
    return {
        targetRefName: `${REF_BRANCH}${SOURCE_BRANCH}`,
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
