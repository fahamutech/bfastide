import {expect} from "chai";
import {readModuleComponents} from "./modules.mjs";
import {resolve} from "node:path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {readModulesFromSrcPath} from "./fsUtils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('ModulesService', function () {
    describe('readModuleComponent', function () {
        it('should read exported component only', async function () {
            const srcPath = resolve(__dirname,'..','test')
            const modules = await readModulesFromSrcPath(srcPath);
            expect(await readModuleComponents(modules[0].path)).eql([
                {name: 'Details', path: resolve(modules[0].path,'components','details.mjs')}
            ])
        });
    });
});