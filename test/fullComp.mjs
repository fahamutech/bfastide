import React, {useEffect, useState} from 'react'
import FormInput from "@components/FormInput/FormInput.component";
import {useTranslation} from "react-i18next";
import {CheckIcon, Select} from "native-base";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import {
    compose,
    itOrEmptyList,
    propertyOr,
    propertyOrNull
} from "../../../../utils/functional";

// @ts-ignore
/**
 * This is the description of the component
 */
export function TransferMoney ({onDone, tabIndex, currentUser}) {
    const[account, setAccount] = useState(accounts[0]);
    const [] = useState();
    const [fsp_obj, setFspObj] = useState({});
    const [cashOutMethod, setCashOutMethod] = useState();
    const [cashOutMethods, setCashOutMethods] = useState([]);
    const [fetchingCashOutMethods, setFetchingCashOutMethods] = useState(false);
    const [errorDialog, setErrorDialog] = useState({state: false, actionRef: 1, message: ''});
    useEffect(() => {
        if (country) {
            fetchCashoutMethods()
        }
    }, []);
    useEffect(() => {
        if (cashOutMethod) {
            fetchFinancialServices(1,[]);
        }
    }, [cashOutMethod,cashOutMethod,
        fetchingCashOutMethods]);
    useEffect(() => {
            if (tabIndex === 0 && currentUser) {
                fetchCountries();
            }
        },

        [

            tabIndex

        ]

    );
    return (
        <View style={{width: '100%', height: '100%', paddingHorizontal: 16}}>
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
        </View>
    );
}
