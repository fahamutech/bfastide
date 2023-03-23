import {
    getComponentFromFileContent,
    readComponentBody,
    readComponentDependencies,
    readComponentDescription, readComponentEffects,
    readComponentProps, readComponentStates
} from "./components.mjs";
import {expect} from "chai";
import {createHash} from "node:crypto";
import {readFile2String} from "./fsUtils.mjs";
import {resolve} from "node:path";
import {dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compactString = x => `${x}`.replace(/\s*/gm, '');

describe('ComponentFunctions', function () {
    describe('readComponentBody', function () {
        it('should return a component body', function () {
            const componentContent = x => `
            export function customText(props){
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
            ]) {
                const body = readComponentBody(componentContent(x));
                expect(compactString(body)).equal(compactString(x));
            }
        });
        it('should return empty body', function () {
            const emptyComponentContent = x => `
            export function customText({props}){
                return ${x}
                ff
            }`;
            for (const x of ['()', '(\n)', '\t(\t)', '\n\n\n(\t\t\t\t)\n\n\n']) {
                const body = readComponentBody(emptyComponentContent(x));
                expect(body).equal('');
            }
        });
        it('should return empty body for non string, empty string and non component string', function () {
            for (const x of [null, undefined, 1, '', '1hkhg', 'function(){return "hello)")}', [], () => null, {}]) {
                const body = readComponentBody(x);
                expect(body).equal('')
            }
        });
    });
    describe('readComponentDescription', function () {
        const componentContent = `
            /***
            *This is the component that is responsible for render text.
            *Happy coding.
            */
            export const customText = props => {
                return (
                   <Text/>
                )
            }`;
        it('should read component description', async function () {
            const answer = `
                This is the component that is responsible for render text.
            Happy coding.`
            expect(compactString(readComponentDescription(componentContent)))
                .equal(compactString(answer));
        });
    });
    describe('readComponentDependencies', function () {
        const componentContent = `
            /***
            *This is the component that is responsible for render text.
            *Happy coding.
            */
            import React,{useState,useEffect} from 'react';
            import Text from '../custom-component';
            import * as bfast from 'bfast';
            import * as moment from 'momentjs';
            import {ScrollView,Compose,FlatList} from 'react-native';
            import {Button} from 'react-native';
            import {OutlineButton} from 'file:my-path';
            export const customText = props => {
                return (
                   <Text/>
                )
            }`;
        it('should return component dependencies', function () {
            expect(readComponentDependencies(componentContent)).eql([
                {name: 'React', reference: 'react', type: 'default'},
                {name: 'useState', reference: 'react', type: 'named'},
                {name: 'useEffect', reference: 'react', type: 'named'},
                {name: 'Text', reference: '../custom-component', type: 'default'},
                {name: 'bfast', reference: 'bfast', type: 'all'},
                {name: 'moment', reference: 'momentjs', type: 'all'},
                {name: 'ScrollView', reference: 'react-native', type: 'named'},
                {name: 'Compose', reference: 'react-native', type: 'named'},
                {name: 'FlatList', reference: 'react-native', type: 'named'},
                {name: 'Button', reference: 'react-native', type: 'named'},
                {name: 'OutlineButton', reference: 'file:my-path', type: "named"},
            ]);
        });
    });
    describe('readComponentProps', function () {
        const componentContent = `
            export function customText({name,style,onValue}){
                return (
                   <Text/>
                )
            }`;
        it('should return a component props', function () {
            expect(readComponentProps(componentContent)).eql(['name', 'style', 'onValue'])
        });
    });
    describe('readComponentStates', function () {
        it('should return component states', function () {
            const componentContent = `
            export function customText({name,style,onValue}){
                const [name,setName]=useState('test');
                const [
                    pic,setPic
                 ] = useState(7)
                const [url,urlSet]=useState()
                return (
                   <Text/>
                )
            }`;
            expect(readComponentStates(componentContent)).eql([
                {state: 'name', setState: 'setName', initialValue: 'test'},
                {state: 'pic', setState: 'setPic', initialValue: '7'},
                {state: 'url', setState: 'urlSet', initialValue: ''},
            ])
        });
    });
    describe('readComponentEffects', function () {
        it('should return component side effects ( useEffect ) ', function () {
            const componentContent = `
            export function customText({name,style,onValue}){
                useEffect(()=>{},[
                    user, key, home,route
                ]);
                useEffect(()=>{
                    const useFull = 1;
                    return function(){
                        cleanUp([name,age]);
                    }
                },[]);
                useEffect(()=>{
                    return function(){
                        cleanUp([name,age]);
                    }
                },[age])
                return (
                   <Text/>
                )
            }`;
            expect(readComponentEffects(componentContent).reduce((a, b) => {
                delete b?.body;
                a.push(b);
                return a;
            }, [])).eql([
                {
                    hash: createHash('sha1').update(`useEffect(()=>{},[
                        user, key, home,route
                    ]);`.replace(/\s*/igm, '')).digest('hex'),
                    dependencies: ['user', 'key', 'home', 'route']
                },
                {
                    hash: createHash('sha1').update(`useEffect(()=>{
                        const useFull = 1;
                        return function(){
                            cleanUp([name,age]);
                        }
                    },[]);`.replace(/\s*/igm, '')).digest('hex'),
                    dependencies: []
                },
                {
                    hash: createHash('sha1').update(`useEffect(()=>{
                        return function(){
                            cleanUp([name,age]);
                        }
                    },[age])`.replace(/\s*/igm, '')).digest('hex'),
                    dependencies: ['age']
                },
            ])
        });
    });
    describe('getComponentFromFileContent', function () {
        it('should return a component presentation', async function () {
            const content = await readFile2String(resolve(__dirname, '../', 'test', 'fullComp.mjs'));
            const component = getComponentFromFileContent('TransferMoney', content);
            expect({
                ...component,
                body: createHash('sha1')
                    .update(component.body.replace(/\s*/gm, ''))
                    .digest('hex'),
                effects: component.effects.map(x => {
                    delete x.body;
                    return x;
                })
            }).deep.equal({
                name: 'TransferMoney',
                description: 'This is the description of the component',
                states: [
                    {
                        state: 'account',
                        setState: 'setAccount',
                        initialValue: 'accounts[0]'
                    },
                    {
                        state: 'fsp_obj',
                        setState: 'setFspObj',
                        initialValue: '{}'
                    },
                    {
                        state: 'cashOutMethod',
                        setState: 'setCashOutMethod',
                        initialValue: ''
                    },
                    {
                        state: 'cashOutMethods',
                        setState: 'setCashOutMethods',
                        initialValue: '[]'
                    },
                    {
                        state: 'fetchingCashOutMethods',
                        setState: 'setFetchingCashOutMethods',
                        initialValue: 'false'
                    },
                    {
                        state: 'errorDialog',
                        setState: 'setErrorDialog',
                        initialValue: '{state: false, actionRef: 1, message: \'\'}'
                    },
                ],
                props: ['onDone', 'tabIndex', 'currentUser'],
                dependencies: [
                    {name: 'React', reference: 'react', type: 'default'},
                    {name: 'useEffect', reference: 'react', type: 'named'},
                    {name: 'useState', reference: 'react', type: 'named'},
                    {name: 'FormInput', reference: '@components/FormInput/FormInput.component', type: 'default'},
                    {name: 'useTranslation', reference: 'react-i18next', type: 'named'},
                    {name: 'CheckIcon', reference: 'native-base', type: 'named'},
                    {name: 'Select', reference: 'native-base', type: 'named'},
                    {name: 'EvilIcons', reference: 'react-native-vector-icons/EvilIcons', type: 'default'},
                    {name: 'compose', reference: '../../../../utils/functional', type: 'named'},
                    {name: 'itOrEmptyList', reference: '../../../../utils/functional', type: 'named'},
                    {name: 'propertyOr', reference: '../../../../utils/functional', type: 'named'},
                    {name: 'propertyOrNull', reference: '../../../../utils/functional', type: 'named'},
                ],
                body: createHash('sha1').update(`<View style={{width: '100%', height: '100%', paddingHorizontal: 16}}>
                    <View style={{height: '100%'}}>
                        <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
                            <Separator/>
                            {country && <Separator/>}
                            {cashOutMethod && country && <Separator/>}
                            <Space height={100}/>
                        </ScrollView>
                        {
                            !countries && <ProceedButton
                                fsp={fsp}
                                cashOutMethod={cashOutMethod}
                                beneficialRef={beneficialRef}
                                onSubmit={onSubmitStepOne}
                            />
                        }
                    </View>
                </View>`.replace(/\s*/mg, '')).digest('hex'),
                effects: [
                    {
                        hash: createHash('sha1').update(` useEffect(() => {
                            if (country) {
                                fetchCashoutMethods()
                            }
                        }, []);`.replace(/\s*/gm, '')).digest('hex'),
                        dependencies: []
                    },
                    {
                        hash: createHash('sha1').update(`useEffect(() => {
                            if (cashOutMethod) {
                                fetchFinancialServices(1,[]);
                            }
                        }, [cashOutMethod,cashOutMethod,
                            fetchingCashOutMethods]);`.replace(/\s*/gm, '')).digest('hex'),
                        dependencies: ['cashOutMethod', 'cashOutMethod', 'fetchingCashOutMethods']
                    },
                    {
                        hash: createHash('sha1').update(`useEffect(() => {
                                if (tabIndex === 0 && currentUser) {
                                    fetchCountries();
                                }
                            },
                    
                            [
                    
                                tabIndex
                    
                            ]
                    
                        );`.replace(/\s*/gm, '')).digest('hex'),
                        dependencies: ['tabIndex']
                    }
                ]

            })
        });
    });
});
