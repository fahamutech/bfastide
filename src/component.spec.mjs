import {readComponentBody} from "./components.mjs";
import {expect} from "chai";

describe('ComponentFunctions', function () {
    describe('readComponentBody', function () {
        it('should return a component body', async function () {
            const componentContent =x => `
            export const customText = props => {
                return (
                   ${x}
                )
            }`;
            for (const x of [
                '<Text> Hello! </Text>',
                `
                    <Text>
                        Hello!
                    </Text>
                `,
                `
                    <View>
                        <h1>Hello</h1>
                        <p>This is paragraph</p>
                    </View>
                `
            ]){
                const body = await readComponentBody(componentContent(x));
                expect(`${body}`.replace(/\s*/gm,''))
                    .equal(`${x}`.replace(/\s*/gm,''));
            }
        });
        it('should return empty body', async function () {
            const emptyComponentContent = x  => `
            export const customText = props => {
                return ${x}
                ff
            }`;
            for (const x of ['()','(\n)','\t(\t)','\n\n\n(\t\t\t\t)\n\n\n']){
                const body = await readComponentBody(emptyComponentContent(x));
                expect(body).equal('');
            }
        });
        it('should return empty body for non string, empty string and non component string', async function () {
            for (const x of [null,undefined,1,'','1hkhg','function(){return "hello)")}',[],()=>null,{}]){
                const body = await readComponentBody(x);
                expect(body).equal('')
            }
        });
    });
});