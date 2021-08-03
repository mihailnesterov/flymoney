import {
    GET_ORDER_SEARCH,
    GET_ORDER_SEARCH_SUCCESS,
    GET_ORDER_SEARCH_ERROR
} from '../types';

const initialState = {
    search: '',
    error: null
};

export const orderSearchReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ORDER_SEARCH:
            return {
                search: '',
                error: null
            }
        case GET_ORDER_SEARCH_SUCCESS:
            return {
                search: action.payload.search,
                error: action.payload.error
            }
        case GET_ORDER_SEARCH_ERROR:
            return {
                search: '',
                error: action.payload
            }
        default:
            return state;
    }
}