const { useState, useEffect } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
//import { getOrders } from '../../api/orders';
import {
    actionOrdersCount,
    actionOrdersCountSuccess,
    actionStatusFilter,
    actionStatusFilterSuccess,
    actionOrderSearch
} from '../../store/actions';

const ordersFromDOM = Object.values(wpReactAdminAppData.orders);

const clearOrderSearchInput = () => {
    document.getElementById("order-search-input").value = "";
}

const Counters = (props) => {

    const {
        statusFilter,
        orderSearch,
        actionOrdersCount: setOrdersCount,
        actionOrdersCountSuccess: setOrdersCountSuccess,
        actionStatusFilter: setStatusFilter,
        actionStatusFilterSuccess: setStatusFilterSuccess,
        actionOrderSearch: setOrderSearch
    } = props;

    const [orders] = useState( ordersFromDOM.map( item => item ) );

    const [ordersPage] = useState(1);
    const [ordersPerPage] = useState(20);

    const [ordersCounter, setOrdersCounter] = useState(0);
    const [ordersProcessingCounter, setOrdersProcessingCounter] = useState(0);
    const [ordersPaidCounter, setOrdersPaidCounter] = useState(0);
    const [ordersHoldCounter, setOrdersHoldCounter] = useState(0);
    const [ordersCancelledCounter, setOrdersCancelledCounter] = useState(0);
    const [ordersRefundedCounter, setOrdersRefundedCounter] = useState(0);

    /*useEffect(() => {
        getOrders(ordersPage, ordersPerPage)
            .then((response) => {
                
                const ordersPrev = orders;
                const ordersCurr = response.data;
                const ordersRes = ordersPrev.concat(ordersCurr);
                
                setOrders(ordersRes);
                
                ordersCurr.length === ordersPerPage && setOrdersPage(ordersPage + 1);
            })
            .catch(err => console.log('Get Orders error', err));
    },[ordersPage]);*/

    useEffect(() => {
        if( orders && orders.length > 0 ) {
            setOrdersCounter( orders.length );
            setOrdersProcessingCounter( orders.filter( item => item.status === 'processing' ).length );
            setOrdersPaidCounter( orders.filter( item => item.status === 'completed' ).length );
            setOrdersHoldCounter( orders.filter( item => item.status === 'on-hold' ).length );
            setOrdersCancelledCounter( orders.filter( item => item.status === 'cancelled' ).length );
            setOrdersRefundedCounter( orders.filter( item => item.status === 'refunded' ).length );
        } 
    }, [orders]);

    useEffect(() => {
        if( orders && orders.length > 0 ) {
            setOrdersCountSuccess({
                count: orders.length,
                page: statusFilter !== '' || orderSearch !== '' ? 1 : ordersPage,
                perPage: ordersPerPage,
                error: null
            });
        }

        return () => {
            setOrdersCount();
        }
    }, [orders, ordersPage, ordersPerPage, statusFilter, orderSearch]);

	return (
        <CountersBlock>
            {
                orders.length > 0 ?
                <>
                { ordersCounter > 0 && 
                    <OrdersCounter 
                        onClick={() => {
                            setStatusFilter();
                            setOrderSearch();
                            clearOrderSearchInput();
                        }}
                    >
                        Всего: {ordersCounter}
                    </OrdersCounter> 
                }
                { ordersProcessingCounter > 0 && 
                    <OrdersCounterProcessing
                        onClick={() => {
                            setStatusFilterSuccess({
                                status: 'processing',
                                error: null
                            });
                            setOrderSearch();
                            clearOrderSearchInput();
                        }
                    }
                    >
                        Обработка: {ordersProcessingCounter}
                    </OrdersCounterProcessing> 
                }
                { ordersPaidCounter > 0 && 
                    <OrdersCounterPaid
                        onClick={() => {
                            setStatusFilterSuccess({
                                status: 'completed',
                                error: null
                            });
                            setOrderSearch();
                            clearOrderSearchInput();
                        }
                    }
                    >
                        Завершено: {ordersPaidCounter}
                    </OrdersCounterPaid> 
                }
                { ordersHoldCounter > 0 && 
                    <OrdersCounterHold
                        onClick={() => {
                            setStatusFilterSuccess({
                                status: 'on-hold',
                                error: null
                            });
                            setOrderSearch();
                            clearOrderSearchInput();
                        }
                    }
                    >
                        Ожидает оплаты: {ordersHoldCounter}
                    </OrdersCounterHold>
                }
                { ordersCancelledCounter > 0 && 
                    <OrdersCounterCancelled
                        onClick={() => {
                            setStatusFilterSuccess({
                                status: 'cancelled',
                                error: null
                            });
                            setOrderSearch();
                            clearOrderSearchInput();
                        }
                    }
                    >
                        Отмена: {ordersCancelledCounter}
                    </OrdersCounterCancelled>
                }
                { ordersRefundedCounter > 0 && 
                    <OrdersCounterRefunded
                        onClick={() => {
                            setStatusFilterSuccess({
                                status: 'refunded',
                                error: null
                            });
                            setOrderSearch();
                            clearOrderSearchInput();
                        }
                    }
                    >
                        Возврат: {ordersRefundedCounter}
                    </OrdersCounterRefunded>
                }
                </>
                :
                <p>Загрузка данных.....</p>
            }
        </CountersBlock>
	);
};

const CountersBlock = styled.div`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.center};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.start};
    gap: ${({ theme: { sizes } }) => sizes.medium};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
`;
const OrdersCounter = styled.span`
    background-color: ${({ theme: { colors } }) => colors.badge};
    color: ${({ theme: { colors } }) => colors.white};
    font-weight: ${({ theme: { fontWeight } }) => fontWeight.bolder};
    padding: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.medium};
    border-radius: ${({ theme: { borderRadius } }) => borderRadius.medium};
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;
const OrdersCounterProcessing = styled(OrdersCounter)`
    background-color: ${({ theme: { colors } }) => colors.blue};
`;
const OrdersCounterPaid = styled(OrdersCounter)`
    background-color: ${({ theme: { colors } }) => colors.green};
`;
const OrdersCounterHold = styled(OrdersCounter)`
    background-color: ${({ theme: { colors } }) => colors.yellow};
`;
const OrdersCounterCancelled = styled(OrdersCounter)`
    background-color: ${({ theme: { colors } }) => colors.red};
`;
const OrdersCounterRefunded = styled(OrdersCounter)`
    background-color: ${({ theme: { colors } }) => colors.gray};
`;

const mapStateToProps = (state) => {
    return {
        count: state.ordersCount.count,
        page: state.ordersCount.page,
        perPage: state.ordersCount.perPage,
        statusFilter: state.statusesFilter.status,
        orderSearch: state.orderSearch.search
    };
}

const mapDispatchToProps = dispatch => {
    return {
            dispatch, 
            ...bindActionCreators(
            {
                actionOrdersCount,
                actionOrdersCountSuccess,
                actionStatusFilter,
                actionStatusFilterSuccess,
                actionOrderSearch
            }, 
            dispatch
        )
    }
};

export default connect( mapStateToProps, mapDispatchToProps )(React.memo(Counters));