import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path'

export const readFile2String = async path => {
    const buffer = await readFile(resolve(path));
    return buffer.toString('utf-8');
}