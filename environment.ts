import dotenv from "dotenv";

dotenv.config();
export const ORG_URL: string = process.env.ORGANIZATION_URL ?? "";
export const TOKEN: string = process.env.PERSONAL_ACCESS_TOKEN ?? "";
export const PROJECT_NAME: string = process.env.PROJECT_NAME ?? "";
export const PR_TITLE: string = process.env.TITLE_PR ?? "";
export const SOURCE_BRANCH: string = process.env.SOURCE_BRANCH ?? "";
export const TARGET_BRANCH: string = process.env.TARGET_BRANCH ?? "";
export const REF_BRANCH: string = "refs/heads/";
export const VARIABLE_GROUP_NEMOTECNIC_NAME: string  = process.env.VARIABLE_GROUP_NEMOTECNIC_NAME ?? "";
export const ENVIRONMENT_NAME: string = process.env.ENVIRONMENT_NAME ?? "";
export const SERVICE: string = process.env.SERVICE ?? "";