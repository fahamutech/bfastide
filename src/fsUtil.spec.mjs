import {readFile2String} from "./fsUtils.mjs";
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
});
