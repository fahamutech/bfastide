import {readFile, readdir, lstat, access} from 'node:fs/promises';
import {resolve} from 'node:path'

export const readFile2String = async path => {
    const buffer = await readFile(resolve(path));
    return buffer.toString('utf-8');
}

const checkFileExist = async path => {
    let exist;
    try {
        await access(path);
        exist = true;
    } catch (e) {
        exist = false;
    }
    return exist;
}

/**
 *
 * @param srcPath
 * @returns {Promise<{path: string, name: string}[]>}
 */
export const readModulesFromSrcPath = async srcPath => {
    const moduleSrcPath = resolve(srcPath, 'modules');
    const exist = await checkFileExist(moduleSrcPath);
    if (exist === false) return [];
    return readdir(moduleSrcPath).then(value => {
        const allP = value.map(async x => {
            const modulePath = resolve(srcPath, 'modules', x);
            const isD = (await lstat(modulePath)).isDirectory();
            return isD ? {name: x, path: modulePath} : null;
        });
        return Promise.all(allP);
    }).then(value2 => value2.filter(x2 => !!x2));
}