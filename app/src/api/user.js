import Axios from 'axios';
 
const api = Axios.create({
    baseURL: wpReactAppSettings.root,
    headers: {
        'content-type': 'application/json',
        'X-WP-Nonce': wpReactAppSettings.nonce
    }
});

export const getCurrentUser = async () => await api.get('/wp/v2/users/' + wpReactAppSettings.user_id);