import {readdir} from "node:fs/promises";
import {resolve} from "node:path";
import {readFile2String} from "./fsUtils.mjs";

export const readModuleComponents = async modulePath => {
    const components = {};
    const componentsPath = resolve(modulePath,'components');
    const contents = await readdir(componentsPath);
    for (const file of contents) {
        const fileContent = await readFile2String(resolve(componentsPath,file));
        const matchSignature = `${fileContent}`
            .match(/^\s*(export)\s+(function)\s+[a-zA-Z0-9_]+\s*\([\s\S]*?\{/gim);
        const name = Array.isArray(matchSignature) && matchSignature.length > 0
            ? matchSignature[0]
                .replace(/^\s*(export)\s+(function)\s+/igm, '')
                .replace(/\s*\([\s\S]*/igm,'')
                .trim()
            : null;
        if(name){
            components[`${file}`.split('.')[0]] = {
                name,
                path: resolve(componentsPath,file)
            }
        }
    }
    return Object.values(components);
}