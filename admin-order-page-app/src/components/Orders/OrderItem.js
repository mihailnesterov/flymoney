const { useState, useEffect, useMemo } = wp.element;
import styled from 'styled-components';
import { getOrderStatus } from '../../api/orders';
import { getUserByID } from '../../api/users';

const OrderItem = ({item, user_id}) => {

    const [orderItem, setOrderItem] = useState(null);
    const [editLock, setEditLock] = useState(null);
    const [userLocks, setUserLocks] = useState(null);

    useMemo(() => {
        if( item.id ) {
            setOrderItem(item);
        }

        return () => {
            setOrderItem(null);
        }
    }, [item]);

    useEffect(() => {
        if( item.id ) {
            setEditLock({
                edit_lock_date: orderItem.edit_lock_date,
                edit_lock_user_id: orderItem.edit_lock_user_id
            });
        }

        return () => {
            setEditLock(null);
        }
    }, [orderItem]);

    useEffect(() => {
        if( editLock && editLock.edit_lock_user_id ) {
            
            getUserByID(editLock.edit_lock_user_id)
                .then((response) => setUserLocks(response.data.name))
                .catch(err => console.log('Get Orders error', err));
        }

        return () => {
            setUserLocks(null);
        }
    }, [editLock]);

    

    /*useEffect(() => {
        
        if(editLock && editLock.edit_lock_date !== "") {
            console.log(orderItem.id, (Date.parse(editLock.edit_lock_date)), Date.now());
        }
    }, [editLock, orderItem]);*/

	return (
        orderItem &&
        <OrderItemLine key={orderItem.id} bg={getOrderStatus(orderItem.status).color}>
            <OrderItemCell>
                <p><b>№</b> {orderItem.id}</p>
                <p><Status bg={getOrderStatus(orderItem.status).bg}>{getOrderStatus(orderItem.status).status}</Status></p>
                <p><span class="dashicons dashicons-calendar-alt"></span> {orderItem.date_created}</p>
                <p><span class="dashicons dashicons-businessperson"></span> {orderItem.billing_first_name}</p>
                <p><span class="dashicons dashicons-phone"></span> {orderItem.billing_phone}</p>
            </OrderItemCell>
            <OrderItemCell>
                <h4>{orderItem.bank_send}</h4>
                <p><b>{parseFloat(orderItem.amount_send).toFixed(2)}</b> {orderItem.send_currency}</p>
                <p>{orderItem.send_from}</p>
                {
                    orderItem.client_status !== 0 && orderItem.client_status !== '' &&
                    <>
                        <p>Статус клиента: <b>{orderItem.client_status}</b></p>
                        {
                            orderItem.discount !== 0 && orderItem.discount !== 0 &&
                            <p>Скидка: <b>{parseFloat(orderItem.discount).toFixed(2)}</b> {orderItem.send_currency}</p>
                        }
                    </>
                }
            </OrderItemCell>
            <OrderItemCell>
                <h4>{orderItem.bank_receive}</h4>
                <p><b>{parseFloat(orderItem.amount_receive).toFixed(2)}</b> {orderItem.receive_currency}</p>
                <p>{orderItem.receive_to}</p>
            </OrderItemCell>
            <OrderItemEditCell>
                {
                    /*orderItem.status === 'completed' 
                    ? 
                    <p title="Заявка выполнена и недоступна для редактирования">
                        <span class="dashicons dashicons-lock"></span>
                    </p>
                    :*/
                    <a 
                        href={'/wp-admin/post.php?post=' + orderItem.id + '&action=edit'}
                        title="Редактировать заявку"
                    >
                        <span class="dashicons dashicons-edit"></span>
                    </a>
                }
            </OrderItemEditCell>
        </OrderItemLine>
	);
};

const OrderItemLine = styled.div`
    flex: ${({ theme: { flex } }) => flex.one};
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    gap: ${({ theme: { sizes } }) => sizes.small};
    //border: 1px ${({ theme: { colors } }) => colors.light} solid;
    border-radius: ${({ theme: { borderRadius } }) => borderRadius.small};
    box-shadow: ${({ theme: { shadow } }) => shadow.medium};
    background-color: ${props => props.bg};
    padding: ${({ theme: { sizes } }) => sizes.small} ${({ theme: { sizes } }) => sizes.xsmall};
    margin-bottom: ${({ theme: { sizes } }) => sizes.medium};
`;
const OrderItemCell = styled.div`
    flex: ${({ theme: { flex } }) => flex.three};
    padding: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.medium};
    & > h4 {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.center};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.start};
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
        gap: ${({ theme: { sizes } }) => sizes.small};
        margin: ${({ theme: { sizes } }) => sizes.none};
        margin-bottom: ${({ theme: { sizes } }) => sizes.small};
    }
    & > p {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.center};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.start};
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
        gap: ${({ theme: { sizes } }) => sizes.small};
        margin: ${({ theme: { sizes } }) => sizes.none};
        margin-bottom: ${({ theme: { sizes } }) => sizes.small};
        & > span {
            color: ${({ theme: { colors } }) => colors.dark};
        }
    }
    & > p:first-child {
        margin-left: ${({ theme: { sizes } }) => sizes.xsmall};
    }
    
`;
const OrderItemEditCell = styled(OrderItemCell)`
    flex: ${({ theme: { flex } }) => flex.one};
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.end};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    gap: ${({ theme: { sizes } }) => sizes.small};
    & > a {
        display: ${({ theme: { display } }) => display.block};
        text-decoration: none;
        text-align: center;
        max-width: 38px;
        background-color: ${({ theme: { colors } }) => colors.yellow};
        color: ${({ theme: { colors } }) => colors.dark};
        padding: ${({ theme: { sizes } }) => sizes.small};
        margin: ${({ theme: { sizes } }) => sizes.none};
        border: 1px ${({ theme: { colors } }) => colors.light} solid;
        border-radius: ${({ theme: { borderRadius } }) => borderRadius.xsmall};
    }
    & > p {
        display: ${({ theme: { display } }) => display.block};
        text-align: center;
        max-width: 38px;
        background-color: ${({ theme: { colors } }) => colors.red};
        color: ${({ theme: { colors } }) => colors.dark};
        padding: ${({ theme: { sizes } }) => sizes.small};
        margin: ${({ theme: { sizes } }) => sizes.none};
        border: 1px ${({ theme: { colors } }) => colors.light} solid;
        border-radius: ${({ theme: { borderRadius } }) => borderRadius.xsmall};
        cursor: pointer;
    }
`;
const Status = styled.b`
    padding: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.medium};
    box-shadow: ${({ theme: { shadow } }) => shadow.xsmall};
    color: ${({ theme: { colors } }) => colors.white};
    background-color: ${props => props.bg};
    border-radius: ${({ theme: { borderRadius } }) => borderRadius.medium};
    min-width: 145px;
    text-align: center;
`;


export default React.memo(OrderItem);