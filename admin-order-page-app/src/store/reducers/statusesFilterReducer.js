import {
    GET_STATUS_FILTER,
    GET_STATUS_FILTER_SUCCESS,
    GET_STATUS_FILTER_ERROR
} from '../types';

const initialState = {
    status: '',
    error: null
};

export const statusesFilterReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_STATUS_FILTER:
            return {
                status: '',
                error: null
            }
        case GET_STATUS_FILTER_SUCCESS:
            return {
                status: action.payload.status,
                error: action.payload.error
            }
        case GET_STATUS_FILTER_ERROR:
            return {
                status: '',
                error: action.payload
            }
        default:
            return state;
    }
}