import {
    GET_ORDERS_COUNT,
    GET_ORDERS_COUNT_SUCCESS,
    GET_ORDERS_COUNT_ERROR,
    GET_STATUS_FILTER,
    GET_STATUS_FILTER_SUCCESS,
    GET_STATUS_FILTER_ERROR,
    GET_ORDER_SEARCH,
    GET_ORDER_SEARCH_SUCCESS,
    GET_ORDER_SEARCH_ERROR
} from '../types';


// Orders Count
export const actionOrdersCount = () => ({
    type: GET_ORDERS_COUNT
});
export const actionOrdersCountSuccess = payload => ({
    type: GET_ORDERS_COUNT_SUCCESS, 
    payload
});
export const actionOrdersCountError = payload => ({
    type: GET_ORDERS_COUNT_ERROR, 
    payload
});

// Statuses Filter
export const actionStatusFilter = () => ({
    type: GET_STATUS_FILTER
});
export const actionStatusFilterSuccess = payload => ({
    type: GET_STATUS_FILTER_SUCCESS, 
    payload
});
export const actionStatusFilterError = payload => ({
    type: GET_STATUS_FILTER_ERROR, 
    payload
});

// Oreder Search
export const actionOrderSearch = () => ({
    type: GET_ORDER_SEARCH
});
export const actionOrderSearchSuccess = payload => ({
    type: GET_ORDER_SEARCH_SUCCESS, 
    payload
});
export const actionOrderSearchError = payload => ({
    type: GET_ORDER_SEARCH_ERROR, 
    payload
});