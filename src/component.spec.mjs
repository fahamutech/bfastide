import {
    readComponentBody,
    readComponentDependencies,
    readComponentDescription,
    readComponentProps
} from "./components.mjs";
import {expect} from "chai";

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
            export const customText = props => {
                return (
                   <Text/>
                )
            }`;
        it('should return component dependencies', function () {
            expect(readComponentDependencies(componentContent)).eql([
                {name: 'React', reference: 'react'},
                {name: 'useState', reference: 'react'},
                {name: 'useEffect', reference: 'react'},
                {name: 'Text', reference: '../custom-component'},
                {name: 'bfast', reference: 'bfast'},
                {name: 'moment', reference: 'momentjs'},
                {name: 'ScrollView', reference: 'react-native'},
                {name: 'Compose', reference: 'react-native'},
                {name: 'FlatList', reference: 'react-native'},
                {name: 'Button', reference: 'react-native'},
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
            expect(readComponentProps(componentContent)).eql(['name','style','onValue'])
        });
    });
});
