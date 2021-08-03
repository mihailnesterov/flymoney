import React from 'react';
const { useState, useMemo, useEffect } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Pannel from '../containers/Pannel';
import { getCustomerById, getOrders } from '../api/products';
import { getCurrentUser } from '../api/user';
import { getOrderDate } from '../api/order';
import { toFloat } from '../api/exchange';
import { 
    actionCustomer, 
    actionCustomerSuccess,
    actionUserStatus,
    actionUserStatusSuccess
} from '../store/actions';

const Customer = (props) => {

    const {
        actionCustomer: setDefaultCustomer, 
        actionCustomerSuccess: setCustomerSuccess,
        actionUserStatus: setDefaultUserStatus,
        actionUserStatusSuccess: setUserStatusSuccess
    } = props;
    
    const [user, setUser] = useState(null);
    const [customer, setCustomer] = useState(null);

    useMemo(() => {
        if( wpReactAppSettings.user_id > 0 ) {
            getCurrentUser()
                .then(response => setUser(response.data))
                .catch(error => console.error("Error Getting WP User", error.response.data));
        }
        
    },[wpReactAppSettings.user_id]);

    useEffect(() => {
             
        if( user ) {
            getCustomerById(user.id)
                .then(response => setCustomer(response.data))
                .catch(error => {
                    console.log("Error Getting WC Customer by ID", error.response.data);
                })
        }
        
    },[user]);

    useEffect(() => {
        
        if( customer ) {
            setCustomerSuccess(customer);
        } 
        
        return () => {
            setDefaultCustomer();
        }
    },[customer]);

    const [customerOrders, setCustomerOrders] = useState([]);
    
    useEffect(() => {
        customer &&
        getOrders()
            .then((response) => {
                setCustomerOrders(
                    response.data.sort((a,b) => 
                    (a.date_created < b.date_created) ? 
                    1 : 
                        (
                            (b.date_created < a.date_created) ? 
                            -1 : 0
                        )
                    )
                    .filter(
                        item => 
                        item.customer_id === customer.id && 
                        item.status === 'on-hold'
                    )
                );
            })
            .catch(err => console.log('Get Orders error', err));
    },[customer]);

    const [isCustomerHasOrders, setIsCustomerHasOrders] = useState(false);
    useEffect(() => {
        customerOrders.length > 0 && setIsCustomerHasOrders(true);
    }, [customerOrders]);

    useEffect(() => {
        if( wpReactAppSettings.user_status ) {
            setUserStatusSuccess(wpReactAppSettings.user_status);
        } 
        
        return () => {
            setDefaultUserStatus();
        }
    },[wpReactAppSettings.user_status]);

	return(
        <Container hidden={isCustomerHasOrders}>
            {
                isCustomerHasOrders &&
                <Pannel>
                    <h3>Неоплаченные заявки</h3>
                    <ul style={{"margin":"0"}}>
                        {
                            customerOrders.map(
                                (item, index) => 
                                <li key={item.id} style={{"display":"flex","justifyContent":"space-between","textAlign":"left"}}>
                                    <span style={{"flex":"1"}}>{index+1}. № <b>{item.id}</b></span>
                                    <span style={{"flex":"2"}}>{item.line_items[0].name}</span>
                                    <span style={{"flex":"1","textAlign":"right"}}>{toFloat(item.meta_data[0].value)} <small>{item.meta_data[4].value}</small></span>
                                    <span style={{"flex":"2","textAlign":"right"}}>{getOrderDate(item.date_created)}</span>
                                </li>
                            )
                        }
                    </ul>
                </Pannel>
            }
        </Container>
    );
};
const Container = styled.div`
    display: ${props => props.hidden === true ? 'block' : 'none'};
`;

// этот customer не используется!
const mapStateToProps = (state) => {
    return {
        customer: state.customer.data
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch, 
        ...bindActionCreators(
            { 
                actionCustomer, 
                actionCustomerSuccess,
                actionUserStatus,
                actionUserStatusSuccess
            }, 
            dispatch
        )
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Customer));