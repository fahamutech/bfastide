import { readdir, stat, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { readFile2String } from "./fsUtils.mjs";
import { getProjectBasePath } from "./index.mjs";

export const createModule = async (projectName, moduleName) => {
    const path = getProjectBasePath(projectName);
    try {
        await stat(resolve(path, 'src', moduleName));
        return { message: 'File or folder with the same name already exists.' }
    } catch (e) {
        await mkdir(resolve(path, 'src', moduleName), { recursive: true });
        return { message: 'module direcetory created.' }
    }
}

export const getAllModules = async projectName => {
    const path = getProjectBasePath(projectName);
    try {
        await stat(resolve(path, 'src'));
        const files = await readdir(resolve(path, 'src'));
        const allP = files.map(async x => {
            try {
                const st = await stat(resolve(path, 'src', x));
                return st.isDirectory() ? x : null;
            } catch (e) {
                return null;
            }
        });
        const dirOny = await Promise.all(allP);
        return dirOny.filter(x => !!x).map(y=>({name:y,path:resolve(path,'src',y)}));
    } catch (e) {
        throw { message: 'Fail to process modules in this project.' }
    }
}

export const readModuleComponents = async (projectName,moduleName) => {
    const components = {};
    const componentsPath = resolve(getProjectBasePath(projectName), 'src', moduleName,'components');
    const contents = await readdir(componentsPath);
    for (const file of contents) {
        const fileContent = await readFile2String(resolve(componentsPath, file));
        const matchSignature = `${fileContent}`
            .match(/^\s*(export)\s+(function)\s+[a-zA-Z0-9_]+\s*\([\s\S]*?\{/gim);
        const name = Array.isArray(matchSignature) && matchSignature.length > 0
            ? matchSignature[0]
                .replace(/^\s*(export)\s+(function)\s+/igm, '')
                .replace(/\s*\([\s\S]*/igm, '')
                .trim()
            : null;
        if (name) {
            components[`${file}`.split('.')[0]] = {
                name,
                path: resolve(componentsPath, file)
            }
        }
    }
    return Object.values(components);
}
