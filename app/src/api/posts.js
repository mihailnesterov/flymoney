import Axios from 'axios';
 
const api = Axios.create({
    baseURL: wpReactAppSettings.root,
    headers: {
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-WP-Nonce': wpReactAppSettings.nonce
    }
});

export const getPosts = async () => await api.get('/wp/v2/posts', {});
export const getFlymoneyExchange = async (search) => await api.get('/wp/v2/flymoney_exchange?per_page=100&search='+search, 
    {}
);
export const getAllFlymoneyExchange = async (per_page=100, search='') => await api.get('/wp/v2/flymoney_exchange?per_page=' + per_page + '&search='+search, 
    {}
);
