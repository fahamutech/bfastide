import {readFile2String, readModulesFromSrcPath} from "./fsUtils.mjs";
import {resolve} from "node:path";
import {expect} from "chai";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('FsUtilSpecs', function () {
    describe('readFile2String', function () {
        it('should read a file content to string', async function () {
            const fileContent = await readFile2String(resolve(__dirname,'../','test','component.mjs'));
            expect(`${fileContent}`.replace(/\s+/ig,'').trim())
                .equal(`exportconsttestComponent=props=>{return(<Text><Head>Hi!</Head></Text>);}`);
        });
    });
    describe('readModulesFromSrcPath', function () {
        it('should read folders only', async function () {
            const srcPath = resolve(__dirname,'..','test');
            const folderContent = await readModulesFromSrcPath(srcPath);
            expect(folderContent).eql([{name: 'core', path: resolve(srcPath,'modules','core')}]);
        });
        it('should return empty module list if path of module dont exists', async function () {
            const srcPath = resolve(__dirname,'..','test_alt');
            const folderContent = await readModulesFromSrcPath(srcPath);
            expect(folderContent).eql([]);
        });
        it('should return empty if module folder is empty', function () {
            it('should return empty module list', async function () {
                const srcPath = resolve(__dirname,'..','test_alt_2');
                const folderContent = await readModulesFromSrcPath(srcPath);
                expect(folderContent).eql([]);
            });
        });
    });
});
