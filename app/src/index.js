const { render } = wp.element;
import { Provider } from 'react-redux';
import store from './store/store';
import App from './components/App'

const root = document.getElementById('flymoney-react-app');

if( root ) 
    render(
        <Provider store={store}>
            <App />
        </Provider>, 
        root
    );