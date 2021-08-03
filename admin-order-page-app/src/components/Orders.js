const { useState, useEffect } = wp.element;
import { connect } from 'react-redux';
import { searchOrder } from '../api/orders';
import styled from 'styled-components';
import OrderItem from './Orders/OrderItem';
import Pagination from './Pagination';

const ordersFromDOM = Object.values(wpReactAdminAppData.orders);
const userIdFromDOM = wpReactAdminAppSettings.user_id;

const Orders = (props) => {

    const {
        count, 
        page, 
        perPage,
        statusFilter,
        orderSearch
    } = props;

    const [orders, setOrders] = useState([]);

    const [ordersPage, setOrdersPage] = useState(page);
    const [ordersPerPage, setOrdersPerPage] = useState(perPage);

    useEffect(() => {
        setOrdersPage(page);
        setOrdersPerPage(perPage);
    },[page, perPage]);

    useEffect(() => {
            
            if( orderSearch !== '') {
                setOrders( searchOrder(ordersFromDOM, orderSearch));
            } else {
                if( statusFilter === '' )
                    setOrders( ordersFromDOM.map(item => item).slice(
                        ( ( ordersPage - 1 ) * ordersPerPage ), 
                        ( ordersPage * ordersPerPage )
                    ) );
                else
                    setOrders( ordersFromDOM.filter(item => item.status === statusFilter).slice(
                        ( ( ordersPage - 1 ) * ordersPerPage ), 
                        ( ordersPage * ordersPerPage )
                    ) );
            }

            
    },[ordersPage, ordersPerPage, statusFilter, orderSearch]);

	return (
        <OrdersBlock>
            <Pagination />
            {
                orderSearch !== '' &&
                <h3>Найдено: <Found>{orders.length}</Found></h3>
            }
            {
                count > 0 && orders.map( item => <OrderItem item={item} user_id={userIdFromDOM} /> )
            }
        </OrdersBlock>
	);
};

const OrdersBlock = styled.div`
    display: ${({ theme: { display } }) => display.block};
`;
const Found = styled.span`
    color: ${({ theme: { colors } }) => colors.green};
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

export default connect( mapStateToProps )(React.memo(Orders));