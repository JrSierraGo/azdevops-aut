import { IGitApi } from 'azure-devops-node-api/GitApi';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { ResourceRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { GitCommitRef, GitPullRequest, GitRefUpdate, GitRepository, PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { PROJECT_NAME, PR_TITLE, SOURCE_BRANCH, REF_BRANCH, NEW_BRANCH } from "../../environment";
import { getGitApi, getWorkItemTrackingApi } from './AZDevopsApiService';


export async function createPullRequest(
    repoName: string, 
    workItemId: number, 
    titlePr:string, 
    sourceBranchName:string, 
    targetBranchName:string
): Promise<GitPullRequest | null> {
    console.log(`Creating PR for ${repoName}`);
    let git: IGitApi = await getGitApi();
    let workItems: ResourceRef[] = await getWorkItem(workItemId);
    let objectPR: GitPullRequest = creteObjectPR(titlePr, sourceBranchName, targetBranchName, workItems);

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

function creteObjectPR(title:string, sourceBranchName:string, targetBranchName:string, workItems?: ResourceRef[]): GitPullRequest {
    return {
        title: title,
        sourceRefName: `${REF_BRANCH}${sourceBranchName}`,
        targetRefName: `${REF_BRANCH}${targetBranchName}`,
        workItemRefs: workItems
    };
}

async function getWorkItem(workItemId: number): Promise<ResourceRef[]> {
    try {
        const workItemApi: IWorkItemTrackingApi = await getWorkItemTrackingApi();

        const workItem = await workItemApi.getWorkItem(workItemId)
        if (!workItem?.id) {
            throw new Error('Work item or its ID not found');
        }
        const reference: ResourceRef[] = [{id: workItem.id.toString(), url: workItem.url}]
        return reference
    } catch (error) {
        let e = error as Error;
        console.error("Error in getWorkItems: ", workItemId, e.message);
        return [];
    }
}

export async function approveAndCompletePR(repoName: string, pullRequestId: number): Promise<void> {
    const gitApi: IGitApi = await getGitApi();

    // Get the pull request
    const pullRequest: GitPullRequest = await gitApi.getPullRequest(repoName, pullRequestId, PROJECT_NAME);

    if (!pullRequest) {
        throw new Error(`Pull request with ID ${pullRequestId} not found in repository ${repoName}`);
    }

    const repositoryId: string = pullRequest.repository?.id ?? "";
    const update: GitPullRequest = {
        status: PullRequestStatus.Completed,
        lastMergeSourceCommit: pullRequest.lastMergeSourceCommit,
    };
    console.log("Update a", update);

    await gitApi.updatePullRequest(update, repositoryId, pullRequestId, PROJECT_NAME);

    console.log(`Pull request ${pullRequestId} in repository ${repoName} has been approved and completed.`);
}

export async function updateDockerfile(repoName: string): Promise<void> {
    try {
        const git = await getGitApi();
        
        // Get repository
        const repo: GitRepository = await git.getRepository(repoName, PROJECT_NAME);
        const branchName = `${REF_BRANCH}${SOURCE_BRANCH}`
        
        // Get ref to Desarrollo branch
        const refs = await git.getRefs(repo.id!, PROJECT_NAME);
        const sourceRef = refs.find(ref => ref.name === branchName);

        if (!sourceRef) {
            throw new Error(`branch ${branchName} not found`);
        }

        // Create new branch
        const refUpdate: GitRefUpdate = {
            name: `${REF_BRANCH}${NEW_BRANCH}`,
            oldObjectId: "0000000000000000000000000000000000000000",
            newObjectId: sourceRef.objectId
        };
        await git.updateRefs([refUpdate], repo.id!, PROJECT_NAME);

        // Get Dockerfile content
        let pathFile = "main.gradle";
        const pathFile2 = "build.gradle";

        let itemFile = await getItemFile(git, pathFile, repo.id!);
        

        if (!itemFile) {
            itemFile = await getItemFile(git, pathFile2, repo.id!);
            pathFile = pathFile2;
            if (!itemFile){
                throw new Error("File not found");
            }
        }

        const linePkgToModify = "";
        const newLinePkg = "";


        // Modify Dockerfile content
        let content: string = itemFile.content;

        if (!content.includes(linePkgToModify)){
            throw new Error("Line not found");
        }
        content = content.replace(linePkgToModify, newLinePkg);

        // Create commit
        const changes = [{
            changeType: 2, // Edit
            item: {
                path: `/${pathFile}`
            },
            newContent: {
                content: content,
                contentType: 0 // RawText
            }
        }];

        const commit: GitCommitRef = {
            comment: PR_TITLE,
            changes: changes
        };

        const push = await git.createPush({
            commits: [commit],
            refUpdates: [{
                name: `refs/heads/${NEW_BRANCH}`,
                oldObjectId: sourceRef.objectId
            }],
            repository: repo
        }, repoName, PROJECT_NAME);

        console.log(`${repoName} Successfully updated File in branch ${NEW_BRANCH}`);

    } catch (error) {
        let e = error as Error;
        console.error("Error updating File:", repoName, e.message);
    }
}

export async function getAllRepositories(): Promise<GitRepository[]> {
    const git = await getGitApi();
    return await git.getRepositories(PROJECT_NAME);
}

async function getItemFile(git: IGitApi, filePath:string, repoId: string): Promise<any> {
    return await git.getItem(
        repoId,
        filePath,
        PROJECT_NAME,
        undefined,
        undefined,
        true,
        true,
        false,
        {version: SOURCE_BRANCH},
        true
    );
}