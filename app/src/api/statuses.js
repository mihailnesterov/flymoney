import Axios from 'axios';
 
const api = Axios.create({
    baseURL: wpReactAppSettings.root,
    headers: {
        'content-type': 'application/json',
        'X-WP-Nonce': wpReactAppSettings.nonce
    }
});

export const getAllStatuses = async () => await api.get('/wp/v2/flymoney_status');
export const getUserStatus = async () => await api.get('/wp/v2/flymoney_status/' + wpReactAppSettings.user_id);
export const getAvailableUserStatus = ( userStatuses, ordersCount ) => {
    
    const statuses = userStatuses.map(item => { 
        return {
            id: item.id,
            title: item.title.rendered,
            quantity: parseInt(item.meta.flymoney_status_meta_quantity[0])
        }
    });

    const availableStatus = statuses.filter(item => item.quantity === (parseInt(ordersCount) + 1) );

    return availableStatus;
}