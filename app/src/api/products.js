import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
 
const api = new WooCommerceRestApi({

    url: "http://localhost/flymoney",
    consumerKey: "ck_4c9f7b0223c229373444322b095bae02b86fb3b8",
    consumerSecret: "cs_83b1e85684a30cd64208bf4eb1d494cdeac173ca",

    /*url: "https://flymoney.biz",
    consumerKey: "ck_8f6169b4b741dc5fedc77ccd3c7c1869bd77b2da",
    consumerSecret: "cs_e98d434a18dcef98fa1d6c046a7ad619d9273806",*/

    version: "wc/v3",
    queryStringAuth: true,  // чтобы работал post
    axiosConfig: {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',  // чтобы работал get/post
            'Content-Type': 'application/json',  // чтобы работал post
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
