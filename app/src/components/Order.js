const { useState, useEffect, useCallback, useMemo } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Timer from 'react-compound-timer';
import { 
    actionLoaderOpen, 
    actionLoaderClose,
    actionModalOpen,
    actionModalClose, 
    actionAmountSendSuccess,
    actionAmountReceiveSuccess
} from '../store/actions';
import { 
    createOrder, 
    createCustomer, 
    updateCustomer, 
    updateOrder, 
    updateProduct 
} from '../api/products';
import { calcAmountSend, calcAmountReceive, toFloat } from '../api/exchange';
import { 
    getPaymentInputFrom, 
    getPaymentInputTo, 
    getMinSumForSend,
    setCustomerToLocalStorage,
    getOrderDate
} from '../api/order';
import { getAllStatuses, getAvailableUserStatus } from '../api/statuses';

const productsFromDOM = Object.values(wpReactAppData.products);
const gatewaysFromDOM = wpReactAppData.gateways;

const Order = (props) => {
    
    const {
        amountSend, 
        amountReceive, 
        order, 
        customer, 
        exchangeRate, 
        tax,
        userStatus,
        actionLoaderOpen: setLoaderOpen, 
        actionLoaderClose: setLoaderClose, 
        actionModalOpen: setModalOpen, 
        actionModalClose: setModalClose,  
        actionAmountSendSuccess: setAmountSendSuccess, 
        actionAmountReceiveSuccess: setAmountReceiveSuccess, 
    } = props;

    const [allStatuses, setAllStatuses] = useState([]);
    useMemo(() => {
        getAllStatuses()
            .then((response) => {
                setAllStatuses(response.data)
            })
            .catch(err => console.log('Get User Statuses error', err));
    }, []);

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
        document.getElementById("input-order-send").value = toFloat( calcAmountSend( 
            amountReceive,
            exchangeRate, 
            tax,
            discount
        ));
    }, []);

    useEffect(() => {
        document.getElementById("input-order-receive").value = toFloat( calcAmountReceive( 
            amountSend,
            exchangeRate, 
            tax,
            discount
        ));
    }, []);

    const [valuteSend, setValuteSend] = useState(null);
    const [valuteReceive, setValuteReceive] = useState(null);
    useEffect(() => {
        
        if(order.product.name) {
            setValuteSend(order.product.valute);
            setValuteReceive(order.variation.valute);
        }
            
    },[order]);
    
    useEffect(() => {
        if(toFloat(amountSend) < getMinSumForSend(valuteSend)) {
            setAmountSendSuccess( getMinSumForSend(valuteSend) );
        }
    },[valuteSend]);

    const [paymentGateways, setPaymentGateways] = useState([]);
    const [payment, setPayment] = useState([]);
    useEffect(() => {
        setPaymentGateways(Object.values(gatewaysFromDOM));    
    }, []);

    useEffect(() => {
        if( paymentGateways.length > 0 ) {
            setPayment(paymentGateways.filter(item => item.id === 'bacs'));
        }
    }, [paymentGateways, valuteSend]);

    const [paymentAccount, setPaymentAccount] = useState(null);

    useEffect(() => {
        if( payment[0] !== undefined ) {
            setPaymentAccount(payment[0].account_details.filter( 
                item => item.bank_name === order.variation.name.split(' - ')[0]
            ));
        }
    }, [payment, order]);

    useEffect(() => {
        setAmountSendSuccess( 
            calcAmountSend( 
                amountReceive,
                order.value, 
                order.tax,
                discount
            )
        );
    }, [amountReceive]);
    
    const [sendFrom, setSendFrom] = useState(null);
    const [receiveTo, setReceiveTo] = useState(null);

    const [senderFio, setSenderFio] = useState(null);
    const [senderEmail, setSenderEmail] = useState(null);
    const [senderPhone, setSenderPhone] = useState(null);
    
    const [receiverFio, setReceiverFio] = useState(null);
    const [receiverPhone, setReceiverPhone] = useState(null);

    const [isDetailFilled, setIsDetailFilled] = useState(false);
    const [messagesFirstStep, setMessagesFirstStep] = useState([]);
    const [messagesSecondStep, setMessagesSecondStep] = useState([]);
    useMemo(() => {
        if( customer.billing ) {
            setSenderFio(customer.billing.first_name);
            setSenderEmail(customer.billing.email);
            setSenderPhone(customer.billing.phone);
        }
    }, [customer]);
    
    useEffect(() => {
        if(
            ( sendFrom && sendFrom !== '')
            &&
            ( receiveTo && receiveTo !== '')
            &&
            ( senderFio && senderFio !== '')
            &&
            ( senderEmail && senderEmail !== '')
            &&
            ( senderPhone && senderPhone !== '')
            &&
            ( receiverFio && receiverFio !== '')
            &&
            ( receiverPhone && receiverPhone !== '')
            &&
            ( (toFloat(amountReceive) - toFloat(order.reserve)) < 0 )
            &&
            ( toFloat(amountSend) >= getMinSumForSend(valuteSend) )
            
            ) {
            setIsDetailFilled(true);
        } else {
            setIsDetailFilled(false);
        }

        const _messagesFirstStep = [];
        !sendFrom && _messagesFirstStep.push('Не заполнен' + getPaymentInputFrom(order.variation.name.split(' - ')[0]).label + ' отправителя');
        (!receiveTo && order.product.name) && _messagesFirstStep.push('Не заполнен' + getPaymentInputTo(order.variation.name.split(' - ')[1]).label + ' получателя');
        ( (toFloat(amountReceive) - toFloat(order.reserve)) > 0 ) && _messagesFirstStep.push('Максимальный лимит для переревода превышен');
        ( toFloat(amountSend) < getMinSumForSend(valuteSend) ) && _messagesFirstStep.push('Сумма перевода меньше ' + getMinSumForSend(valuteSend) + ' ' + valuteSend );
        
        const _messagesSecondStep = [];
        !senderFio && _messagesSecondStep.push('Не заполнено ФИО отправителя');
        !senderEmail && _messagesSecondStep.push('Не заполнен Email отправителя');
        !senderPhone && _messagesSecondStep.push('Не заполнен телефон отправителя');
        !receiverFio && _messagesSecondStep.push('Не заполнено ФИО получателя');
        !receiverPhone && _messagesSecondStep.push('Не заполнен телефон получателя');

        setMessagesFirstStep(_messagesFirstStep);
        setMessagesSecondStep(_messagesSecondStep);
        
    }, [
        sendFrom, 
        receiveTo, 
        senderFio, 
        senderEmail, 
        senderPhone, 
        receiverFio, 
        receiverPhone,
        order
    ]);

    const [step, setStep] = useState(true);

    const [isOrderSent, setIsOrderSent] = useState(false);

    const [orderCreated, setOrderCreated] = useState(null);

    const [isOrderPaid, setIsOrderPaid] = useState(false);

    const sendOrder = useCallback(() => {
        
        setLoaderOpen();
        
        const orderData = {
            customer_id: customer.id !== undefined ? customer.id : 0,
            payment_method: payment[0].id,
            payment_method_title: payment[0].method_title,
            set_paid: false,
            status: 'on-hold', //processing
            currency: valuteSend,
            billing: {
                first_name: senderFio,
                email: senderEmail,
                phone: senderPhone
            },
            line_items: [
                {
                    product_id: order.product.id,
                    variation_id: order.variation.id,
                    tax_class: order.tax_class,
                    quantity: 1,
                    subtotal: amountSend,
                    total: amountSend,
                    total_tax: order.tax
                }
            ],
            meta_data: [
                {
                    key: 'amount_send',
                    value: amountSend
                },
                {
                    key: 'amount_receive',
                    value: amountReceive
                },
                {
                    key: 'send_from',
                    value: sendFrom
                },
                {
                    key: 'receive_to',
                    value: receiveTo
                },
                {
                    key: 'send_currency',
                    value: order.product.valute
                },
                {
                    key: 'receive_currency',
                    value: order.variation.valute
                },
                {
                    key: 'receive_commission',
                    value: order.commission
                },
                {
                    key: 'receiver_fio',
                    value: receiverFio
                },
                {
                    key: 'receiver_phone',
                    value: receiverPhone
                },
                {
                    key: 'exchange_rate',
                    value: order.value
                },
                {
                    key: 'client_status',
                    value: userStatus.status
                },
                {
                    key: 'discount',
                    value: ((amountSend * discount) / 100)
                }
            ]
        };

        const customerData = {
            email: senderEmail,
            first_name: senderFio,
            billing: {
              first_name: senderFio,
              email: senderEmail,
              phone: senderPhone
            }
          };

        const updatedProduct = productsFromDOM.filter(
            item => item.name === order.variation.name.split(' - ')[1]
        )[0];

        const updatedProductStockQuantity = {
            stock_quantity: (toFloat(updatedProduct.stock_quantity) - toFloat(amountReceive, 0))
        };

        setTimeout(() => {

            let newOrderID = null;

            createOrder(orderData)
                .then(response => {
                    
                    console.log('Order success:', response.data);

                    setOrderCreated(response.data);
                    
                    newOrderID = response.data.id;
                    
                    if( updatedProduct.ID ) {
                        // stock_quantity update
                        updateProduct(updatedProduct.ID, updatedProductStockQuantity)
                            .then(res => console.log('Product Updated:', res.data))
                            .catch(error => {
                                console.log("Product Update error:", error.res.data);
                            });
                    }
                    
                    if( newOrderID && localStorage.getItem('_flymoney_customer_id') ) {

                        const updatedOrderCustomerID = {
                            customer_id: localStorage.getItem('_flymoney_customer_id')
                        };
                        // order update customer id
                        updateOrder(newOrderID, updatedOrderCustomerID)
                            .then(res => console.log('Order Updated:', res.data))
                            .catch(error => {
                                console.log("Order Update error:", error.res.data);
                            });
                    }

                })
                .catch(error => {
                    console.log("Order error:", error.response.data);
                })
                .finally(() => setLoaderClose());

            if( customer.id === undefined ) {
                createCustomer(customerData)
                    .then(response => { 
                        console.log('Create customer success:', response.data);
                        setCustomerToLocalStorage(response.data.id);
                    })
                    .catch(error => {
                        console.log("Create customer error:", error.response.data);
                });
            }
                    
            setIsOrderSent(true);

        }, 2000);
        
    }, [
        valuteSend, 
        valuteReceive, 
        sendFrom, 
        receiveTo, 
        senderFio, 
        senderEmail, 
        senderPhone, 
        receiverFio, 
        receiverPhone,
        messagesFirstStep,
        messagesSecondStep,
        order,
        payment,
        customer,
        paymentAccount,
        userStatus,
        discount
    ]);

    useEffect(() => {

        if( customer.id ) {

            let availableUserStatus = [];

            if( allStatuses.length > 0 ) {
                availableUserStatus = getAvailableUserStatus( allStatuses, wpReactAppSettings.user_orders_count );
            }  
    
            if( isOrderPaid === true ) {
    
                const clientStatusMeta = customer.meta_data.filter(item => item.key === 'client_status' );
                
                if ( clientStatusMeta.length > 0 && availableUserStatus.length > 0 ) {
    
                    const updatedClientStatusMeta = {
                        meta_data: [{
                            id: clientStatusMeta[0].id,
                            key: clientStatusMeta[0].key,
                            value: availableUserStatus[0].id.toString()
                        }]
                    }

                    updateCustomer(updatedClientStatusMeta)
                        .then(res => {
                            console.log('Customer Status Updated:', res.data);
                        })
                        .catch(error => {
                            console.log("Customer Status Update error:", error.res.data);
                        });
                }
                
            }
        }

    }, [allStatuses, customer, isOrderPaid, wpReactAppSettings.user_orders_count]);

    
	return(
        <Wrapper>
            <CloseButton
                onClick={() => setModalClose()}
                title="Закрыть"
            >&#10540;</CloseButton>
            <Header>
                <h3>
                    {
                        isOrderSent
                        ?
                        (
                            orderCreated ?
                            <span style={{"color": "#7854f7"}}>Ваша заявка получена!</span> :
                            <>Отправка заявки......</>
                        )
                        :
                        <>Обмен  <img src={order.product.image} style={{"width":"0.9em","marginBottom":"0.1em"}}/> <b style={{"color": "#7854f7"}}>{order.variation.name.split(' - ')[0]}</b>  &#10230;  <img src={order.variation.image} style={{"width":"0.9em","marginBottom":"0.1em"}}/> <b style={{"color": "#7854f7"}}>{order.variation.name.split(' - ')[1]}</b></>
                    }
                </h3>
                <div>
                    <small>ВНИМАНИЕ! Обработка заявки от 5 минут до 2 часов рабочего времени сервиса. Услуга VISA/Master TRY доступна только в рабочие часы турецких банков с 09:00 до 16:00 по будням!</small>
                </div>
            </Header>
            <Content>
                {
                    isOrderSent && orderCreated && 
                    
                    <DetailsBlock visible={isOrderSent}>
                        
                        <OrderTimerBlock>
                            {
                                !isOrderPaid && 
                                <div>
                                    <p>Осталось времени на оплату</p>
                                    
                                    <OrderTimer>
                                        <Timer
                                            initialTime={1200000}
                                            direction="backward"
                                        >
                                            {() => (
                                                <>
                                                    <span><Timer.Minutes /></span>
                                                    <span>:</span>
                                                    <span><Timer.Seconds /></span>
                                                </>
                                            )}
                                        </Timer>
                                    </OrderTimer>

                                    <PayButton 
                                        onClick={() => {
                                            setLoaderOpen();
                                            updateOrder(orderCreated.id, {status: 'processing'})
                                                .then(res => {
                                                    console.log('Order Status Updated:', res.data);
                                                    setIsOrderPaid(true);
                                                })
                                                .catch(error => {
                                                    console.log("Order Status Update error:", error.res.data);
                                                })
                                                .finally(() => {
                                                    setLoaderClose();
                                                });
                                            }
                                        }
                                    >
                                        &#129689; Я оплатил(а)
                                    </PayButton>

                                </div>
                            }
                            
                            { 
                                isOrderPaid && 
                                <>
                                <p style={{"marginBottom":"1.5rem"}}>Для отслеживания заявки, перейдите в личный кабинет</p> 
                                <OrderButton 
                                    onClick={() => {
                                            window.location.href = 'https://flymoney.biz/account/orders/'; 
                                        }
                                    }
                                >
                                    &#9993; Мои заявки
                                </OrderButton>
                                </>

                            }

                            {/*<OrderButton 
                                onClick={() => {
                                        setModalClose();
                                        setTimeout(() => setModalOpen(), 100);
                                    }
                                }
                            >
                                Создать еще одну заявку
                            </OrderButton>*/}

                        </OrderTimerBlock>

                        {
                            !isOrderPaid &&
                            <OrderDetailsBlock>
                            
                                <h5>Для того, чтобы завершить транзакцию, оплатите пожалуйста Вашу заявку.</h5>
                                
                                <p>Для оплаты заявки Вам нужно:</p>

                                <ol>
                                    <li><span>Зайти в личный кабинет Вашего банка</span></li>
                                    <li><span>Сделать денежный перевод суммы</span></li>
                                        <ul>
                                            <li><span><b>{orderCreated.line_items[0].total}</b> <small>{orderCreated.meta_data[4].value}</small></span></li>
                                            {
                                                (payment.length > 0 && payment[0].title && paymentAccount && paymentAccount[0]) &&
                                                <li><span>{ payment[0].title }: {paymentAccount[0].account_name} <b>{paymentAccount[0].account_number}</b> {paymentAccount[0].sort_code}</span></li>
                                            }
                                        </ul>
                                    <li><span>Важно! Комментарий к платежу оставьте пустым</span></li>
                                    <li><span>После выполненной процедуры, нажмите кнопку "Я оплатил(а)"</span></li>
                                </ol>
                                <p>Внимание! В случае невыполнения какого-либо из пунктов, заявка будет аннулирована.</p>
                                <p>По всем вопросам можете обратиться в техподдержку</p>
                            </OrderDetailsBlock>
                        }

                        {
                            isOrderPaid &&
                            <OrderDetailsBlock>
                            
                                <h5>Детали заявки</h5>
                                
                                <ul>
                                    <li><span>Заявка №: <b>{orderCreated.number}</b> создана: {getOrderDate(orderCreated.date_created)}</span></li>
                                    <li><span>{orderCreated.line_items[0].name}</span></li>
                                    <li><span>{orderCreated.meta_data[2].value}</span></li>
                                    <li><span>{orderCreated.meta_data[3].value}</span></li>
                                    <li><span>Сумма: <b>{orderCreated.line_items[0].total}</b> <small>{orderCreated.meta_data[4].value}</small></span></li>
                                    {
                                        userStatus.status &&  
                                        <>
                                        <li>
                                            <span>Ваш статус: <small style={{
                                                "backgroundColor":userStatus.color,
                                                "padding":"4px 8px",
                                                "borderRadius":"8px",
                                                "fontWeight":"bold"
                                            }}>{userStatus.status}</small></span>
                                        </li>
                                        <li><span>Ваша скидка: <b>{toFloat(orderCreated.meta_data[11].value)}</b> <small>{orderCreated.meta_data[4].value}</small></span></li>
                                        </>
                                    }
                                    {
                                        /*(payment.length > 0 && payment[0].title && paymentAccount && paymentAccount[0]) &&
                                        <li><span>{ payment[0].title }: {paymentAccount[0].account_name} <b>{paymentAccount[0].account_number}</b> {paymentAccount[0].sort_code}</span></li>*/
                                    }
                                    {
                                        /*(payment.length > 0 && payment[0].description) && 
                                        <li><span>{ payment[0].description }</span></li>*/
                                    }
                                </ul>

                            </OrderDetailsBlock>
                        }
                        

                    </DetailsBlock>
                }
                <PaymentBlock visible={step}>
                    
                    <h4>Отдаете</h4>
                    
                    <label for="input-order-send">
                        <input 
                            id="input-order-send"
                            type="text"
                            placeholder="Сумма к выдаче"
                            autoComplete="off"
                            onChange={
                                (e) => {
                                    let sendSumValue = 0;
                                    e.target.value !== '' && (sendSumValue = e.target.value);
                                    
                                    document.getElementById("input-order-receive").value = toFloat( calcAmountReceive( 
                                        sendSumValue,
                                        exchangeRate, 
                                        tax,
                                        discount
                                    ));
                                    document.getElementById("input-send").value = toFloat( sendSumValue );
                                    document.getElementById("input-receive").value = toFloat( calcAmountReceive( 
                                        sendSumValue,
                                        exchangeRate, 
                                        tax,
                                        discount
                                    ));
                                    setAmountSendSuccess( toFloat(sendSumValue) );
                                }
                            }
                            style={{
                                "fontWeight":"400",
                                "fontSize":"1.1em",
                                "border": "1px #7854f7 solid"
                            }}
                        />
                        {' '}<small style={{"color": "#7854f7"}}>{valuteSend && valuteSend}</small>
                    </label>
                    
                    {
                        valuteSend && (
                            <>
                                <label for="input-order-send-card">
                                    <input 
                                        id="input-order-send-card"
                                        type="text"
                                        //autoComplete="on"
                                        placeholder={getPaymentInputFrom(order.variation.name.split(' - ')[0]).placeholder}
                                        onChange={(e) => setSendFrom(
                                            e.target.value !== ''
                                            ?
                                            getPaymentInputFrom(order.variation.name.split(' - ')[0]).placeholder + ': ' + e.target.value
                                            :
                                            null
                                            )
                                        }
                                        style={{
                                            "fontWeight":"400",
                                            "fontSize":"1.1em",
                                            "border": "1px #7854f7 solid"
                                        }}
                                    />
                                    <small style={{"color": "#7854f7"}}>{getPaymentInputFrom(order.variation.name.split(' - ')[0]).label}</small>
                                </label>
                                {/*<ul style={{"color": "#7854f7"}}>
                                    {
                                        (payment.length > 0 && payment[0].title && paymentAccount && paymentAccount[0]) &&
                                        <>
                                        <li><span style={{"color": "#666","fontSize": "14px"}}>{ payment[0].title }</span> <b style={{"color": "#666","fontSize": "14px"}}>{paymentAccount[0].account_name}</b> <span style={{"fontSize": "14px"}}>{paymentAccount[0].account_number}</span></li>
                                        <li><span style={{"color": "#666","fontSize": "14px"}}>На имя</span> <b style={{"fontSize": "14px"}}>{paymentAccount[0].sort_code}</b></li>
                                        </>
                                    }
                                    {
                                        (payment.length > 0 && payment[0].description) && 
                                        <li><span style={{"color": "#666"}}>{ payment[0].description }</span></li>
                                    }
                                </ul>*/}
                                {
                                    userStatus.status &&  
                                    <ul style={{"color": "#7854f7"}}>
                                        <li><span style={{"color": "#666"}}>Ваш статус: <b style={{
                                            "backgroundColor":userStatus.color,
                                            "padding":"4px 8px",
                                            "borderRadius":"8px"
                                        }}>{userStatus.status}</b></span></li>
                                        <li><span style={{"color": "#666"}}>Ваша скидка: <b>{toFloat((amountSend * discount) / 100)}</b> {valuteSend}</span></li>
                                    </ul>
                                }
                            </>
                        )
                    }                    
                </PaymentBlock>

                <PaymentBlock visible={step}>
                    
                    <h4>Получаете</h4>
                    
                    <label for="input-order-receive">
                        <input 
                            id="input-order-receive"
                            type="text"
                            placeholder="Сумма к получению"
                            autoComplete="off"
                            onChange={(e) => {
                                    let receiveSumValue = 0;
                                    e.target.value !== '' && (receiveSumValue = e.target.value);
                                    document.getElementById("input-order-send").value = toFloat( calcAmountSend( 
                                        receiveSumValue,
                                        exchangeRate, 
                                        tax,
                                        discount
                                    ));
                                    document.getElementById("input-receive").value = toFloat( receiveSumValue );
                                    document.getElementById("input-send").value = toFloat( calcAmountSend( 
                                        receiveSumValue,
                                        exchangeRate, 
                                        tax,
                                        discount
                                    ));

                                    setAmountReceiveSuccess( toFloat(receiveSumValue) );
                                }
                            }
                            style={{
                                "fontWeight":"400",
                                "fontSize":"1.1em",
                                "border": "1px #7854f7 solid"
                            }}
                        />
                        {' '}<small style={{"color": "#7854f7"}}>{order.product.name && valuteReceive}</small>
                    </label>

                    {
                        order.variation.name && (
                            <>
                                <label for="input-order-receive-card">
                                    <input 
                                        id="input-order-receive-card"
                                        type="text"
                                        autoComplete="on"
                                        placeholder={getPaymentInputTo(order.variation.name.split(' - ')[1]).placeholder}
                                        onChange={(e) => setReceiveTo(
                                            e.target.value !== ''
                                            ?
                                            getPaymentInputTo(order.variation.name.split(' - ')[1]).placeholder + ': ' + e.target.value
                                            :
                                            null
                                            )
                                        }
                                        style={{
                                            "fontWeight":"400",
                                            "fontSize":"1.1em",
                                            "border": "1px #7854f7 solid"
                                        }}
                                    />
                                    <small style={{"color": "#7854f7"}}>{getPaymentInputTo(order.variation.name.split(' - ')[1]).label}</small>
                                </label>
                                <ul style={{"color": "#7854f7"}}>
                                    <li><span style={{"color": "#666"}}>Минимальная сумма обмена: <b>{getMinSumForSend(valuteSend)}</b> {valuteSend}</span></li>
                                    <li><span style={{"color": "#666"}}>Максимальная сумма обмена: <b>{order.reserve}</b> {valuteReceive}</span></li>
                                </ul>
                            </>
                        )
                    }
                </PaymentBlock>
                
                <ButtonsBlock 
                    visible={step} 
                    first 
                    messages={messagesFirstStep.length}
                >
                    {
                        messagesFirstStep.length > 0 &&
                        <ul>
                            {
                                messagesFirstStep.map(item => <li>{item}</li>)
                            }
                        </ul>
                    }
                    <OrderButton onClick={() => {
                            setStep(false);
                            scroll(0,0);
                        }
                    }
                    >
                        Далее &#10095;
                    </OrderButton>
                </ButtonsBlock>

                <DetailsBlock visible={!step && !isOrderSent}>
                    
                    <h4>Детали оплаты</h4>
                    
                    <Detail>
                        <label for="input-order-sender-fio">
                            <input 
                                id="input-order-sender-fio"
                                type="text"
                                autoComplete="off"
                                placeholder="ФИО отправителя *"
                                required
                                defaultValue={ senderFio }
                                onChange={(e) => setSenderFio(e.target.value)}
                            />
                        </label>
                        <label for="input-order-sender-email">
                            <input 
                                id="input-order-sender-email"
                                type="email"
                                autoComplete="off"
                                placeholder="Email отправителя *"
                                required
                                defaultValue={ senderEmail }
                                onChange={(e) => setSenderEmail(e.target.value)}
                            />
                        </label>
                        <label for="input-order-sender-phone">
                            <input 
                                id="input-order-sender-phone"
                                type="text"
                                autoComplete="off"
                                placeholder="Телефон отправителя *"
                                required
                                defaultValue={ senderPhone }
                                onChange={(e) => setSenderPhone(e.target.value)}
                            />
                        </label>
                    </Detail>
                    <Detail>
                        <label for="input-order-receiver-fio">
                            <input 
                                id="input-order-receiver-fio"
                                type="text"
                                autoComplete="on"
                                placeholder="ФИО получателя *"
                                required
                                onChange={(e) => setReceiverFio(e.target.value)}
                            />
                        </label>
                        <label for="input-order-receiver-phone">
                            <input 
                                id="input-order-receiver-phone"
                                type="text"
                                autoComplete="off"
                                placeholder="Телефон получателя *"
                                required
                                onChange={(e) => setReceiverPhone(e.target.value)}
                            />
                        </label>
                    </Detail>
                </DetailsBlock>

                <ButtonsBlock 
                    visible={!step && !isOrderSent} 
                    messages={Number(messagesFirstStep.length) + Number(messagesSecondStep.length)}
                >
                    <OrderButton onClick={() => {
                            setStep(true);
                            scroll(0,0);
                        }
                    }
                    >
                        &#10094; Вернуться
                    </OrderButton>
                    {
                        (
                            messagesFirstStep.length > 0 
                            || 
                            messagesSecondStep.length > 0
                        )
                        &&
                        <>
                            {
                                messagesFirstStep.length > 0 
                                &&
                                <ul>
                                    { messagesFirstStep.map( item => <li>{item}</li> ) }
                                </ul>
                            }
                            {
                                messagesSecondStep.length > 0 
                                &&
                                <ul>
                                    { messagesSecondStep.map( item => <li>{item}</li> ) }
                                </ul>
                            }  
                        </>                    
                    }
                    <OrderButton 
                        disabled={!isDetailFilled}
                        onClick={() => sendOrder()}
                    >
                        &#10004; Обменять
                    </OrderButton>
                </ButtonsBlock>

                <ButtonsBlock 
                    visible={isOrderSent}
                    sent
                >
                    <OrderButton 
                        onClick={() => setModalClose()}
                    >
                        &#10540; Закрыть
                    </OrderButton>

                </ButtonsBlock>
            </Content>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    position: relative;
    padding: ${({ theme: { sizes } }) => sizes.large};
    margin:  ${({ theme: { sizes } }) => sizes.none};
    color: ${({ theme: { colors } }) => colors.dark};
`;
const CloseButton = styled.button`
    position: absolute;
    top: ${({ theme: { sizes } }) => sizes.large};
    right: ${({ theme: { sizes } }) => sizes.large};
    z-index: 1000;
    font-size: ${({ theme: { sizes } }) => sizes.large};
    font-weight: ${({ theme: { fontWeight } }) => fontWeight.bolder};
    color: ${({ theme: { colors } }) => colors.dark};
    background-color: ${({ theme: { colors } }) => colors.white};
    padding: ${({ theme: { sizes } }) => sizes.none};
    margin:  ${({ theme: { sizes } }) => sizes.none};
    margin-left:  ${({ theme: { sizes } }) => sizes.small};
    border: ${({ theme: { sizes } }) => sizes.none};
    outline: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    &:hover {
        color: ${({ theme: { colors } }) => colors.dark};
        background-color: ${({ theme: { colors } }) => colors.white};
        opacity: 0.85;
    }
`;
const Header = styled.div`
    display: ${({ theme: { display } }) => display.block};
    margin-bottom:  ${({ theme: { sizes } }) => sizes.medium};
    & > H3 {
        border-bottom: 1px ${({ theme: { colors } }) => colors.light} solid;
        padding-bottom: ${({ theme: { sizes } }) => sizes.xsmall};
        margin-right:  ${({ theme: { sizes } }) => sizes.small};
    }
`;
const Content = styled.div`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    gap: ${({ theme: { sizes } }) => sizes.small};
`;
const PaymentBlock = styled.div`
    display: ${({ theme: { display } }) => props => props.visible ? display.block : display.none};
    flex: ${({ theme: { flex } }) => flex.one};
    & > label {
        & > input[type="text"] {
            margin: ${({ theme: { sizes } }) => sizes.small} 0;
        }
    }
    & > ul {
        list-style-type: disc;
        margin: 0 0 0 ${({ theme: { sizes } }) => sizes.small};
        & > li {
            font-size: 12px;
        }
    }
`;
const DetailsBlock = styled.div`
    flex: unset;
    width:100%;
    display: ${({ theme: { display } }) => props => props.visible ? display.flex : display.none};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    gap: ${({ theme: { sizes } }) => sizes.small};
    & > h4 {
        width: 100%;
        margin: ${({ theme: { sizes } }) => sizes.xsmall} 0 0 0;
    }
    @media (max-width: 1199.98px) {
        display: ${({ theme: { display } }) => props => props.visible ? display.flex : display.none};
        align-items: ${({ theme: { alignItems } }) => alignItems.start};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    }
    @media (max-width: 767.98px) {
        display: ${({ theme: { display } }) => props => props.visible ? display.block : display.none};
    }
`;
const Detail = styled.div`
    flex: ${({ theme: { flex } }) => flex.one};
    & > label {
        & > input[type="text"] {
            margin: ${({ theme: { sizes } }) => sizes.xsmall} 0;
            width: 100%;
        }
        & > input[type="email"] {
            margin: ${({ theme: { sizes } }) => sizes.xsmall} 0;
            width: 100%;
        }
    }
`;
const ButtonsBlock = styled.div`
    flex: unset;
    width:100%;
    display: ${({ theme: { display } }) => props => props.visible ? display.flex : display.none};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => 
        props => 
            (props.first && props.messages === 0) ||
            props.sent ? 
            justifyContent.end : 
            justifyContent.between
    };
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    gap: ${({ theme: { sizes } }) => sizes.small};
    margin: ${({ theme: { sizes } }) => sizes.none};
    padding: ${({ theme: { sizes } }) => sizes.medium} 0 0 0;
    border-top: 1px ${({ theme: { colors } }) => colors.light} solid;
    & > ul {
        list-style-type: disc;
        margin: 0 0 0 ${({ theme: { sizes } }) => sizes.small};
        & > li {
            font-size: 12px;
            color: red;
        }
    }
    @media (max-width: 767.98px) {
        display: ${({ theme: { display } }) => props => props.visible ? (props.first ? display.flex : (props.messages === 0 ? display.flex : display.block)) : display.none};
        & > ul {
            margin-top: ${({ theme: { sizes } }) => props => !props.first ? sizes.small : sizes.none};
            margin-bottom: ${({ theme: { sizes } }) => props => !props.first ? sizes.small : sizes.none};
            &:first-child {
                margin-bottom: ${({ theme: { sizes } }) => sizes.none};
            }
            &:last-child {
                margin-top: ${({ theme: { sizes } }) => sizes.none};
            }
        }
    }
`;
const OrderButton = styled.button`
    border: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    background-color: ${props => props.disabled ? '#666' : '#7854f7'};
    color: ${({ theme: { colors } }) => colors.white};
    padding: 0.7rem ${({ theme: { sizes } }) => sizes.small};
    margin: ${({ theme: { sizes } }) => sizes.none};
    text-align: ${({ theme: { textAlign } }) => textAlign.center};
    opacity: ${props => props.disabled ? 0.8 : 1};
    &:hover {
        cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
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
`;

const OrderTimerBlock = styled.div`
    flex: ${({ theme: { flex } }) => flex.two};
    text-align: center;
    background-color: #D8E1E8;
    padding: 2rem 1.5rem;
    & > p {
        text-align: center;
        margin-bottom: 0.4rem;
    }
    margin-bottom: 1rem;
`;

const OrderTimer = styled.p`
    text-align: center;
    margin: 0;
    margin-bottom: 1.5rem;
    & > span {
        font-size: 4rem;
        font-weight: 900;
        margin: 3px;
        padding: 10px;
        background-color: #333;
        color: #fff;
        border-radius: 4px;
        box-shadow: 1px 2px 4px rgba(0,0,0,0,18);
        &:nth-child(2) {
            margin: 0 2px;
            padding: 0;
            background-color: transparent;
            color: #333;
            border-radius: unset;
            box-shadow: unset;
        }
    }
`;

const OrderDetailsBlock = styled.div`
    flex: ${({ theme: { flex } }) => flex.three};
    text-align: left;
    background-color: #fff;
    padding: 0 1rem;
    margin-bottom: 1rem;
    & > h5 {
        text-align: left;
        margin-bottom: 0.5rem;
    }
    & > p {
        text-align: left;
        margin-bottom: 0.5rem;
        font-weight: ${({ theme: { fontWeight } }) => fontWeight.bolder};
    }
    & > ul,
    & > ol,
    & > ol > ul {
        margin: 0;
        margin-bottom: 1rem;
        margin-left: 0.8rem;
        & > li {
            color: #7854f7;
            line-height: 1.8;
            & > small {
                color: #666;
            }
            & > span {
                color: #666;
                & > b {
                    color: #7854f7;
                }
            }
        }
    }
`;

const PayButton = styled.button`
    border: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    background-color: #7854f7;
    color: ${({ theme: { colors } }) => colors.white};
    padding: 0.7rem ${({ theme: { sizes } }) => sizes.small};
    margin: ${({ theme: { sizes } }) => sizes.none};
    margin-bottom: ${({ theme: { sizes } }) => sizes.large};
    text-align: ${({ theme: { textAlign } }) => textAlign.center};
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
`;

const mapStateToProps = (state) => {
    return {
        amountSend: state.amountSend.amount,
        amountReceive: state.amountReceive.amount,
        order: {
            product: state.order.product,
            variation: state.order.variation,
            nominal: state.order.nominal, 
            value: state.order.value, 
            tax: state.order.tax,
            tax_class: state.order.tax_class,
            commission: state.order.commission,
            reserve: state.order.reserve,
            sender: state.order.sender,
            receiver: state.order.receiver,
            error: state.order.error
        },
        isLoaderOpen: state.loader.isOpen,
        customer: state.customer.data,
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
                actionLoaderOpen, 
                actionLoaderClose,
                actionModalOpen,
                actionModalClose, 
                actionAmountSendSuccess,
                actionAmountReceiveSuccess
            }, 
            dispatch
        )
    }
};

export default connect( mapStateToProps, mapDispatchToProps )(React.memo(Order));