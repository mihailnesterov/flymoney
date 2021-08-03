import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
 
const api = new WooCommerceRestApi({

    url: "your_web_site_url",
    consumerKey: "ck_your_cunsumer_key",
    consumerSecret: "cs_your_consumer_secret",

    version: "wc/v3",
    queryStringAuth: true,
    axiosConfig: {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    }
  
});

export const getAllProducts = async () => await api.get("products", {
    per_page: 100, // 100 products per page
});

export const getProduct = async (id) => await api.get("products/" + id);

export const updateProduct = async (id, data) => await api.put("products/" + id, data);

export const getProductVariations = async (id) => await api.get("products/" + id + "/variations");

export const getAllTaxes = async () => await api.get("taxes", {});

export const getAllTaxClasses = async () => await api.get("taxes/classes");

export const getPaymentGateways = async () => await api.get("payment_gateways");

export const getOrders = async () => await api.get("orders");

export const createOrder = async (data) => await api.post("orders", data);

export const updateOrder = async (id, data) => await api.put("orders/" + id, data);

export const getCustomers = async () => await api.get("customers");

export const getCustomerById = async () => await api.get("customers/" + wpReactAppSettings.user_id);

export const createCustomer = async (data) => await api.post("customers", data);

export const updateCustomer = async (data) => await api.put("customers/" + wpReactAppSettings.user_id, data);
