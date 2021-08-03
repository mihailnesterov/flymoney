import { combineReducers } from "redux";

import { ordersCountReducer } from "./ordersCountReducer";
import { statusesFilterReducer } from "./statusesFilterReducer";
import { orderSearchReducer } from "./orderSearchReducer";

export const rootReduser = combineReducers({
    ordersCount: ordersCountReducer,
    statusesFilter: statusesFilterReducer,
    orderSearch: orderSearchReducer
});