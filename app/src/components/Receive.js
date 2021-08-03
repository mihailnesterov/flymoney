const { useState,  useEffect, useMemo } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Block from '../containers/Block';
import BanksList from '../containers/BanksList';
import Empty from '../components/Empty';
import { calcAmountSend, calcAmountReceive, toFloat } from '../api/exchange';
import { 
    actionModalOpen,
    actionAmountReceive,
    actionAmountReceiveSuccess,
    actionOrderSuccess,
    actionBankReceiveSuccess,
    actionExchangeRate,
    actionExchangeRateSuccess,
    actionTax,
    actionTaxSuccess
} from '../store/actions';

const productsFromDOM = Object.values(wpReactAppData.products);
const valutesFromDOM = wpReactAppData.valutes;
const taxesFromDOM = wpReactAppData.taxes.map(tax => Object.values(tax)[0]);

const Receive = (props) => {

    const {
        amountSend, 
        amountReceive, 
        isLoaderOpen, 
        bankSend, 
        bankReceive,
        userStatus,
        actionModalOpen: setModalOpen,
        actionAmountReceive: setAmountReceive,
        actionAmountReceiveSuccess: setAmountReceiveSuccess,
        actionOrderSuccess: setOrderSuccess,
        actionBankReceiveSuccess: setBankReceiveSuccess,
        actionExchangeRate: setExchangeRate,
        actionExchangeRateSuccess: setExchangeRateSuccess,
        actionTax: setTax,
        actionTaxSuccess: setTaxSuccess,
    } = props;

    const [emptyText, setEmptyText] = useState('');
    
    useEffect(() => {
        isLoaderOpen 
        ? 
        setEmptyText('Загружается список банков...')
        :
        setEmptyText('Выберите банк с которого отдаете средства')
    }, [isLoaderOpen]);

    const [banksSendReserve] = useState(
        productsFromDOM.map(item => {
            return {
                id: item.ID,
                name: item.name,
                reserve: item.stock_quantity
            }
        })
    );

    const [banksReceive, setBanksReceive] = useState(null);
    
    useEffect(() => {
        if( bankSend ) {
            setBanksReceive(
                bankSend.variations.map(item => {
                    return {
                        id: item.ID,
                        name: item.name,
                        image: item.image_src,
                        valute: item.valute,
                        tax_status: item.tax_status,
                        tax_class: item.tax_class,
                        reserve: item.stock_quantity
                    }
                })
            );
        }
    }, [bankSend]);
    
    const [selectedBankID, setSelectedBankID] = useState(null);
    
    const [selectedBank, setSelectedBank] = useState({});
    
    useEffect(() => {
        if(selectedBankID) {
            setSelectedBank(banksReceive.filter(item => item.id === selectedBankID)[0]);
            document.getElementById("input-send").value = '0.00';
            document.getElementById("input-receive").value = '0.00';
        }
    }, [selectedBankID]);

    const [selectedBankReserve, setSelectedBankReserve] = useState(null);

    const [selectedBankTax, setSelectedBankTax] = useState(0.00);
    
    useEffect(() => {

        setSelectedBankReserve(null);

        if(selectedBank.id) {
            setAmountReceive();
            setBankReceiveSuccess(selectedBank);

            const _tax = taxesFromDOM.filter(tax => tax.tax_rate_class === selectedBank.tax_class)[0];
            setSelectedBankTax(_tax !== undefined ? _tax.tax_rate : 0.00);

            const _sendBank = banksSendReserve.filter(item => item.name === selectedBank.name.split(' - ')[1])[0];
            if(_sendBank && _sendBank !== undefined ) {
                setSelectedBankReserve( toFloat(_sendBank.reserve, 2) );
            }
        }
    }, [selectedBank]);

    const [valutes] = useState(
        valutesFromDOM.map(item => {
            return {
                country: item.country,
                base_currency: item.base_currency,
                base_name: item.base_name,
                target_currency: item.target_currency,
                target_name: item.target_name,
                nominal: item.nominal,
                exchange_rate: item.exchange_rate,
                inverse_rate: item.inverse_rate
            }
        })
    );
    
    const [valute, setValute] = useState(null);
    
    useEffect(() => {
        if(selectedBank.id) {
            setValute(
                valutes.filter(item => 
                    item.base_currency === bankSend.valute && 
                    item.target_currency === selectedBank.valute 
                )[0]
            );
        }
    }, [bankSend, selectedBank, valutes]);

    const [discount, setDiscount] = useState(0);
    useMemo(() => {
        if(userStatus.discount) {
            setDiscount(userStatus.discount);
        }
        return () => {
            setDiscount(0);
        }
    }, [userStatus]);
    
    useEffect(() => {

        if(valute) {
            
            setAmountReceiveSuccess(
                calcAmountReceive( 
                    amountSend,
                    valute.exchange_rate, 
                    selectedBankTax,
                    discount
                )
            );
        }
        
        return () => {
            setAmountReceive();
        }
    }, [valute, amountSend, selectedBankTax]);

    useEffect(() => {
        valute && valute.exchange_rate !== undefined 
        ?
        setExchangeRateSuccess(valute.exchange_rate)
        : 
        setExchangeRate();
    }, [valute]);

    useEffect(() => {
        selectedBankTax ? setTaxSuccess(selectedBankTax) : setTax()
    }, [selectedBankTax]);
    
	return (
        <Block>
            <h3>Получаете</h3>
            <label for="input-receive" style={{"position":"relative"}}>
            <input 
                id="input-receive"
                type="text"
                autoComplete="off"
                placeholder="Сумма к получению"
                defaultValue={ amountReceive > 0 ? amountReceive : '0.00' }
                onChange={(e) => {

                        document.getElementById("input-send").value = toFloat( calcAmountSend( 
                            e.target.value,
                            valute.exchange_rate, 
                            selectedBankTax,
                            discount
                        ));

                        setAmountReceiveSuccess( e.target.value );
                        setExchangeRateSuccess( valute.exchange_rate );
                        setTaxSuccess( selectedBankTax );
                    
                    }
                }
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
                    banksReceive && banksReceive.length > 0 
                    ?
                    banksReceive.map(
                        (item) => 
                        <li key={item.id}>
                            <ReceiveButton
                                selected={selectedBankID && selectedBankID === item.id ? true : false}
                                onClick={() => setSelectedBankID(item.id)}
                                title={item.name}
                            >
                                <img src={item.image} />
                                {item.name.split(' - ')[1]}
                            </ReceiveButton>
                            {
                                selectedBankID && 
                                selectedBankID === item.id && 
                                valute && 
                                valute !== undefined &&
                                (toFloat(amountReceive) - toFloat(selectedBankReserve)) < 0 &&
                                (amountSend > 0 && amountReceive > 0)
                                &&
                                <ExchangeButton 
                                    onClick={() => {

                                        setModalOpen();

                                        scroll(0,0);

                                        setOrderSuccess(
                                            {
                                                product: bankSend,
                                                variation: bankReceive,
                                                nominal: valute.nominal, 
                                                value: valute.exchange_rate, 
                                                tax: selectedBankTax,
                                                tax_class: selectedBank.tax_class,
                                                commission: 
                                                    toFloat(
                                                        toFloat(amountSend)
                                                        *
                                                        parseFloat(valute.exchange_rate)
                                                        * 
                                                        ( (selectedBankTax - discount) / 100)
                                                    )
                                                ,
                                                reserve: selectedBankReserve,
                                                sender: {},
                                                receiver: {},
                                                error: null
                                            }
                                        );
                                    }}
                                >
                                    Обменять
                                </ExchangeButton>
                            }
                            {
                                selectedBankID && selectedBankID === item.id &&
                                <ReceiveInfo>
                                { !valute ? 
                                    <small style={{"color":"red"}}>Курс обмена не найден</small> : 
                                    <>
                                        <p>
                                            <small>Отдаете</small>
                                            <small>
                                                <b>{toFloat(amountSend)}</b>
                                                {' '}
                                                {valute.base_currency}
                                            </small>
                                        </p>
                                        <p>
                                            <small>Получаете</small>
                                            <small>
                                                <b>{toFloat(amountReceive)}</b>
                                                {' '}
                                                {valute.target_currency}
                                            </small>
                                        </p>
                                        {
                                            discount > 0 
                                            && 
                                            userStatus.status 
                                            &&
                                            (toFloat(amountReceive) - toFloat(selectedBankReserve)) < 0
                                            &&
                                            (
                                                <>
                                                <p>
                                                    <small>Ваш статус</small>
                                                    <small>
                                                        <b style={{
                                                            "backgroundColor":userStatus.color,
                                                            "padding":"4px 8px",
                                                            "borderRadius":"8px"
                                                        }}>{userStatus.status}</b>
                                                    </small>
                                                </p>
                                                <p>
                                                    <small>Ваша скидка</small>
                                                    <small>
                                                        <b>
                                                            {
                                                                toFloat((amountSend * discount) / 100)
                                                            }
                                                        </b>
                                                        {' '}
                                                        {valute.base_currency}
                                                    </small>
                                                </p>
                                                </>
                                            )
                                        }
                                        {
                                            selectedBankReserve && selectedBankReserve > 0
                                            &&
                                            (
                                                <p>
                                                    <small>Резерв</small>
                                                    <small>
                                                        <b>{selectedBankReserve}</b>
                                                        {' '}
                                                        {valute.target_currency}
                                                    </small>
                                                </p>
                                            )
                                        }
                                        {
                                            (toFloat(amountReceive) - toFloat(selectedBankReserve)) > 0
                                            &&
                                            <p>
                                                <small style={{"color":"red"}}>
                                                    Максимальный лимит для переревода превышен
                                                </small>
                                            </p>
                                        }
                                    </>
                                }
                                </ReceiveInfo>
                            }
                        </li>
                    )
                    :
                    <Empty emptyText={emptyText} />
                }
            </BanksList>
        </Block>
	);
};

const ReceiveButton = styled.button`
    flex: ${({ theme: { flex } }) => flex.two};
    border: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    background-color: ${props => props.selected === true ? '#7854f7' :  '#fff'};
    color: ${props => props.selected === true ? '#fff' :  '#222'};
    padding: 0.7rem;
    margin: ${({ theme: { sizes } }) => sizes.none};
    text-align: ${({ theme: { textAlign } }) => textAlign.left};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
const ExchangeButton = styled.button`
    flex: ${({ theme: { flex } }) => flex.one};
    border: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    background-color: ${props => props.selected === true ? '#9457B9' :  '#18c139'};
    color: ${props => props.selected === true ? '#eee' :  '#fff'};
    padding: 1rem;
    margin: ${({ theme: { sizes } }) => sizes.none};
    &:hover {
        background-color: #18c139;
        opacity: 0.85;
    }
    &:active {
        background-color: #18c139;
    }
    &:focus {
        background-color: #18c139;
    }
    &:target {
        background-color: #18c139;
    }
`;
const ReceiveInfo = styled.div`
    justify-self: auto;
    padding: ${({ theme: { sizes } }) => sizes.xsmall};
    margin: ${({ theme: { sizes } }) => sizes.none};
    background-color: #f9f9f9;
    width: 100%;
    line-height: 1;
    & > p {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.center};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
        gap: ${({ theme: { sizes } }) => sizes.xsmall};
        line-height: 1.4;
        margin: ${({ theme: { sizes } }) => sizes.none};
        border-bottom: 1px #eee solid;
        padding: 0.25rem 0;
        &:first-child {
            padding-top: ${({ theme: { sizes } }) => sizes.none};
        }
        &:last-child {
            border-bottom: ${({ theme: { sizes } }) => sizes.none};
            padding-bottom: ${({ theme: { sizes } }) => sizes.none};
        }
    }
`;

const mapStateToProps = (state) => {
    return {
        amountSend: state.amountSend.amount,
        amountReceive: state.amountReceive.amount,
        isLoaderOpen: state.loader.isOpen,
        bankSend: state.bankSend.bank,
        bankReceive: state.bankReceive.bank,
        userStatus: state.userStatus.status
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch,
        ...bindActionCreators(
        {
            actionModalOpen,
            actionAmountReceive,
            actionAmountReceiveSuccess,
            actionOrderSuccess,
            actionBankReceiveSuccess,
            actionExchangeRate,
            actionExchangeRateSuccess,
            actionTax,
            actionTaxSuccess
        }, 
        dispatch
    )}
};

export default connect( mapStateToProps, mapDispatchToProps )(React.memo(Receive));