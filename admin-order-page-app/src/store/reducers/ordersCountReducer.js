import {
    GET_ORDERS_COUNT,
    GET_ORDERS_COUNT_SUCCESS,
    GET_ORDERS_COUNT_ERROR
} from '../types';

const initialState = {
    count: 0,
    page: 1,
    perPage: 20,
    error: null
};

export const ordersCountReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ORDERS_COUNT:
            return {
                count: 0,
                page: 1,
                perPage: 20,
                error: null
            }
        case GET_ORDERS_COUNT_SUCCESS:
            return {
                count: action.payload.count,
                page: action.payload.page,
                perPage: action.payload.perPage,
                error: null
            }
        case GET_ORDERS_COUNT_ERROR:
            return {
                count: 0,
                page: 1,
                perPage: 20,
                error: action.payload
            }
        default:
            return state;
    }
}