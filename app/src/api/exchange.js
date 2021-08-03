export const calcAmountSend = ( amountReceive, value, tax_rate, discount ) => {
    return value === 0 || tax_rate === 0 ? 0 : toFloat(
        parseFloat(amountReceive)
        / 
        (
            parseFloat(value)
            - 
            ( 
                parseFloat(value)
                * 
                ( ( parseFloat(tax_rate) - parseFloat(discount) ) / 100 ) 
            ) 
        ),
        8
    );
}
export const calcAmountReceive = ( amountSend, value, tax_rate, discount ) => {
    return value === 0 || tax_rate === 0 ? 0 : toFloat( 
        parseFloat(amountSend)
        * 
        (
            parseFloat(value)
            - 
            ( 
                parseFloat(value)
                * 
                ( ( parseFloat(tax_rate) - parseFloat(discount) ) / 100 ) 
            )
        ),
        8
    );
}
export const getValuteName = (name) => {
    return name.split(' ')[name.split(' ').length-1];
}
export const toFloat = (value, fixed=2) => {
    return parseFloat(value).toFixed(fixed);
}
export const getExchangeRates = (exchangeRates) => {
        
    const rates = [];
    
    for( let i = 0; i < exchangeRates.length; i++ ) {
        for( let j = 0; j < exchangeRates.length; j++ ) {
            if( exchangeRates[i] !== exchangeRates[j] )
                rates.push(exchangeRates[i] + '-' + exchangeRates[j]);
        }
    }

    return rates;
}