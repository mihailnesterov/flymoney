import { createStore } from 'redux';
import { rootReduser } from "./reducers";

export default createStore( 
    rootReduser, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);