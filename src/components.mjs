import {readFile2String} from "./fs_utils.mjs";
// const fileData = await readFile2String(filePath);

export const readComponentBody = async fileContent => {
    const matched = `${fileContent}`.match(/((return)\s*\(\s*)(\s.+)*\s*\)/igm);
    const removedReturn = matched && matched.length > 0
        ? `${matched[0]}`.replace(/((return)\s*\(\s*)/igm, '')
        : '';
    return removedReturn.length > 0
        ? removedReturn.trim().substring(0,removedReturn.length - 1).trim()
        : removedReturn.trim();
}

export const readComponentBodyFromFile = async path => {

}
