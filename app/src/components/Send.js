import React from 'react';
const { useState, useEffect, useMemo } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Block from '../containers/Block';
import BanksList from '../containers/BanksList';
import Empty from '../components/Empty';
import { toFloat, calcAmountReceive, calcAmountSend } from '../api/exchange';
import {
    actionAmountSend,
    actionAmountSendSuccess,
    actionAmountReceive,
    actionBankSendSuccess,
    actionBankReceive
} from '../store/actions';

const productsFromDOM = Object.values(wpReactAppData.products);

const Send = (props) => {

    const {
        amountSend, 
        amountReceive, 
        isLoaderOpen, 
        exchangeRate, 
        tax,
        userStatus,
        actionAmountSend: setAmountSend,
        actionAmountSendSuccess: setAmountSendSuccess,
        actionAmountReceive: setAmountReceive,
        actionBankSendSuccess: setBankSendSuccess,
        actionBankReceive: setBankReceive,
    } = props;

    const [emptyText, setEmptyText] = useState('');
    
    useEffect(() => {
        isLoaderOpen 
        ? 
        setEmptyText('Загружается список банков...')
        :
        setEmptyText('Список банков с которых отдаете средства')
    }, [isLoaderOpen]);

    const [banksSend] = useState(
        productsFromDOM.map(item => {
            return {
                id: item.ID,
                name: item.name,
                image: item.image_src,
                valute: item.valute,
                variations: item.variations,
                reserve: item.stock_quantity
            }
        })
    );
    
    const [selectedBankID, setSelectedBankID] = useState(null);
    const [selectedBank, setSelectedBank] = useState({});
    
    useEffect(() => {
        if(selectedBankID) {
            setSelectedBank(banksSend.filter(item => item.id === selectedBankID)[0]);
        }
        setBankReceive();
    }, [selectedBankID]);
    
    useEffect(() => {
        if(selectedBank.id) {
            
            setBankSendSuccess(selectedBank);            
            setAmountReceive();
            
            document.getElementById("input-send").value = '0.00';
            document.getElementById("input-receive").value = '0.00';

        }
    }, [selectedBank]);

    const [discount, setDiscount] = useState(0);
    useMemo(() => {
        if(userStatus.discount) {
            setDiscount(userStatus.discount);
        }
    }, [userStatus]);

    useMemo(() => {
            
        setAmountSendSuccess(
            calcAmountSend( 
                amountReceive, 
                exchangeRate, 
                tax,
                discount
            )
        );

        return () => {
            setAmountSend();
        }

    }, [amountReceive, exchangeRate, tax]);

	return (
        <Block>
            <h3>Отдаете</h3>
            <label for="input-send" style={{"position":"relative"}}>
                <input 
                    id="input-send"
                    type="text"
                    autoComplete="off"
                    placeholder="Сумма к выдаче"
                    defaultValue={amountSend > 0 ? amountSend : '0.00'}
                    onChange={(e) => {
                        let sendSumValue = 0;
                        e.target.value !== '' && (sendSumValue = e.target.value);
                        document.getElementById("input-receive").value = toFloat( calcAmountReceive( 
                            sendSumValue,
                            exchangeRate,
                            tax,
                            discount
                        ));
                            
                        setAmountSendSuccess( sendSumValue );
                    }}
                    style={{
                        "width":"100%",
                        "fontWeight":"bolder",
                        "fontSize":"1.1em",
                        "border": "1px #7854f7 solid"
                    }}
                />
                <small style={{
                    "position": "absolute",
                    "right": "10px",
                    "top": "0",
                    "color": "#7854f7"
                }}>
                    { !selectedBankID ? 'Валюта не выбрана' : selectedBank.valute }
                </small>
            </label>
            <BanksList>
                {
                    banksSend && banksSend.length > 0
                    ?
                    banksSend.map(
                        (item) => 
                        <li key={item.id}>
                            <SendButton
                                selected={selectedBankID === item.id ? true : false}
                                onClick = {() => setSelectedBankID(item.id)}
                            >
                                <img src={item.image} />
                                {item.name}
                            </SendButton>
                        </li>
                    )
                    :
                    <Empty emptyText={emptyText} />
                }
            </BanksList>
        </Block>
        
	);
};

const SendButton = styled.button`
    flex: ${({ theme: { flex } }) => flex.one};
    border: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    background-color: ${props => props.selected === true ? '#7854f7' :  '#fff'};
    color: ${props => props.selected === true ? '#fff' :  '#222'};
    padding: 0.7rem;
    margin: ${({ theme: { sizes } }) => sizes.none};
    text-align: ${({ theme: { textAlign } }) => textAlign.left};
    &:hover {
        background-color: #7854f7;
        opacity: 0.85;
    }
    &:active {
        background-color: #7854f7;
    }
    &:focus {
        background-color: #7854f7;
    }
    &:target {
        background-color: #7854f7;
    }
    & > img {
        width: ${({ theme: { sizes } }) => sizes.large};
        margin-right: ${({ theme: { sizes } }) => sizes.xsmall};
    }
`;

const mapStateToProps = (state) => {
    return {
        amountSend: state.amountSend.amount,
        amountReceive: state.amountReceive.amount,
        isLoaderOpen: state.loader.isOpen,
        bankSend: state.bankSend.bank,
        exchangeRate: state.exchangeRate.rate,
        tax: state.tax.tax,
        userStatus: state.userStatus.status
    };
}

const mapDispatchToProps = dispatch => {
    return {
            dispatch, 
            ...bindActionCreators(
            { 
                actionAmountSend,
                actionAmountSendSuccess,
                actionAmountReceive,
                actionBankSendSuccess,
                actionBankReceive
            }, 
            dispatch
        )
    }
};

export default connect( mapStateToProps, mapDispatchToProps )(React.memo(Send));