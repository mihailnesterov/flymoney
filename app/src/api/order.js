export const getPaymentById = (id, paymentGateways=[]) => {
    return paymentGateways.filter(item => item.id === id);
}
export const getPaymentInputFrom = (send_name) => {
    
    let placeholder = '';
    let label = '';
    
    const first = send_name.split(' ')[0];
    const last = send_name.split(' ')[send_name.split(' ').length-1];

    // ищем по валюте...
    switch (last) {
        case 'TRY':
            placeholder = 'С IBAN отправителя';
            label = ' IBAN';
            break;
        default:
            placeholder = 'С карты отправителя';
            label = ' № карты';
            break;
    }

    // ищем Qiwi, Яндекс или Юмани...
    switch (first) {
        case 'Qiwi':
            placeholder = 'С кошелька Qiwi';
            label = ' № кошелька';
            break;
        case 'Яндекс.Деньги':
            placeholder = 'С кошелька Яндекс.Деньги';
            label = ' № кошелька';
            break;
        case 'Yandex':
            placeholder = 'С кошелька Яндекс.Деньги';
            label = ' № кошелька';
            break;
        case 'ЮMoney':
            placeholder = 'С кошелька YooMoney';
            label = ' № кошелька';
            break;
        case 'Yoomoney':
            placeholder = 'С кошелька YooMoney';
            label = ' № кошелька';
            break;
    }

    return { placeholder, label };
}
export const getPaymentInputTo = (product_name) => {
    
    let placeholder = '';
    let label = '';
    
    const first = product_name.split(' ')[0];
    const last = product_name.split(' ')[product_name.split(' ').length-1];

    // ищем по валюте...
    switch (last) {
        case 'TRY':
            placeholder = 'На IBAN получателя';
            label = ' IBAN';
            break;
        default:
            placeholder = 'На карту получателя';
            label = ' № карты';
            break;
    }

    // ищем Qiwi, Яндекс или Юмани...
    switch (first) {
        case 'Qiwi':
            placeholder = 'На кошелёк Qiwi';
            label = ' № кошелька';
            break;
        case 'Яндекс.Деньги':
            placeholder = 'На кошелёк Яндекс.Деньги';
            label = ' № кошелька';
            break;
        case 'Yandex':
            placeholder = 'На кошелёк Яндекс.Деньги';
            label = ' № кошелька';
            break;
        case 'ЮMoney':
            placeholder = 'На кошелёк YooMoney';
            label = ' № кошелька';
            break;
        case 'Yoomoney':
            placeholder = 'На кошелёк YooMoney';
            label = ' № кошелька';
            break;
    }

    return { placeholder, label };
}
export const getMinSumForSend = (valuteSend) => {
    let minSum = 50;
    switch (valuteSend) {
        case 'RUB':
            minSum = 500;
            break;
        case 'UAH':
            minSum = 200;
            break;
        case 'TRY':
            minSum = 50;
            break;
        default:
            minSum = 50;
            break;
    }

    return Number(minSum);
}
export const setCustomerToLocalStorage = (id) => {
    localStorage.setItem('_flymoney_customer_id', id);
}
export const getOrderDate = (date) => {
    const d = new Date(date);
    return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
        d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}