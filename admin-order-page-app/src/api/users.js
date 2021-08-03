import Axios from 'axios';
 
const api = Axios.create({
    baseURL: wpReactAdminAppSettings.root,
    headers: {
        'content-type': 'application/json',
        'X-WP-Nonce': wpReactAdminAppSettings.nonce
    }
});

export const getCurrentUser = async () => await api.get('/wp/v2/users/' + wpReactAdminAppSettings.user_id);
export const getUserByID = async (id) => await api.get('/wp/v2/users/' + id);