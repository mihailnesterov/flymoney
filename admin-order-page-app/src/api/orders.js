import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
 
const api = new WooCommerceRestApi({

    url: "http://localhost/flymoney",
    consumerKey: "ck_4c9f7b0223c229373444322b095bae02b86fb3b8",
    consumerSecret: "cs_83b1e85684a30cd64208bf4eb1d494cdeac173ca",

    /*url: "https://flymoney.biz",
    consumerKey: "ck_8f6169b4b741dc5fedc77ccd3c7c1869bd77b2da",
    consumerSecret: "cs_e98d434a18dcef98fa1d6c046a7ad619d9273806",*/

    version: "wc/v3",
    queryStringAuth: true,
    axiosConfig: {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    }
  
});

export const getOrders = async (page = 1, per_page = 100) => await api.get("orders", {
    per_page: per_page, // qty orders per page
    page: page, // page number
});

export const getOrder = async (id) => await api.get("orders/" + id);

export const getOrderStatus = ( status ) => {
    let translated = {
        status: '',
        color: '#fff',
        offscreenBuffering: '#fff'
    };
    switch (status) {
        case 'processing':
            translated.status = 'Обработка';
            translated.color = "#F2FAFF";
            translated.bg = "#82C8EE";
            break;
        case 'on-hold':
            translated.status = 'Ожидает оплаты';
            translated.color = '#FFFEF2';
            translated.bg = "#FDDB03";
            break;
        case 'completed':
            translated.status = 'Завершена';
            translated.color = '#F5FFDF';
            translated.bg = "#91D110";
            break;
        case 'cancelled':
            translated.status = 'Отменена';
            translated.color = '#FFF3F2';
            translated.bg = "#F8BAB6";
            break;
        case 'refunded':
            translated.status = 'Ошибка в заявке';
            translated.color = '#f5f5f5';
            translated.bg = "#DBD9D9";
            break;
    }

    return translated;
}

export const searchOrder = (orders, value) => {
    const matches = [];
    for (let i = 0; i < orders.length; i++) {
        for(let prop in orders[i]) {
            if ( orders[i][prop] && orders[i][prop] !== '' && typeof orders[i][prop] !== Boolean ) {
                if ( orders[i][prop].toString().toLowerCase().indexOf(value.toLowerCase()) !== -1 ) {
                    matches.push(orders[i]);
                    break;
                }
            }
        }
    }
    
    return matches;
}