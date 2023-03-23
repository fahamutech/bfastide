import { resolve } from "node:path";
import { homedir } from "node:os";

const bfastProjectDirectory = 'BFastProjects';
export const getProjectBasePath = projectName => resolve(homedir(), bfastProjectDirectory, projectName);
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
