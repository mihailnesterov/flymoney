const { useState, useEffect } = wp.element;
import { connect } from 'react-redux';
import styled from 'styled-components';
import Empty from './Empty';
import { getOrders } from '../api/products';
import { getOrderDate } from '../api/order';

const productsFromDOM = Object.values(wpReactAppData.products);

const getSender = (exchange) => {
    return exchange.line_items[0].name.split(' - ')[0];
}

const getReceiver = (exchange) => {
    return exchange.line_items[0].name.split(' - ')[1];
}

const LastExchanges = (props) => {

    const {isLoaderOpen} = props;

    const [banks] = useState(
        productsFromDOM.map(item => {
            return {
                id: item.ID,
                name: item.name,
                image: item.image_src,
                valute: item.valute,
                reserve: item.stock_quantity
            }
        })
    );

    const [emptyText, setEmptyText] = useState('');
    
    useEffect(() => {
        isLoaderOpen 
        ? 
        setEmptyText('Загружаются последние обмены...')
        :
        setEmptyText('Список пуст')
    }, [isLoaderOpen]);

    const [exchanges, setExchanges] = useState([]);

    useEffect(() => {
        getOrders()
            .then((response) => {
                setExchanges(
                    response.data.sort((a,b) => 
                    (a.date_created < b.date_created) ? 
                    1 : 
                        (
                            (b.date_created < a.date_created) ? 
                            -1 : 0
                        )
                    )
                    .slice(0, 5));
            })
            .catch(err => console.log('Get Orders error', err));
    },[]);

	return (
        <>
            <h3>Последние обмены</h3>
            <LastExchangesList>
                {   
                    exchanges && exchanges.length > 0
                    ?
                    exchanges.filter(
                        exchange => exchange.total !== '0.00' && exchange.total !== ''
                    ).map(
                        (exchange, index) => 
                        <LastExchangesListItem key={exchange.id} index={index}>
                            <span>
                                &#128197;
                                {' '}
                                {getOrderDate(exchange.date_created)}
                            </span>
                            <span>
                                {
                                    banks.filter(b => b.name === getSender(exchange))[0] && 
                                    <img style={{"flex":"1"}} src={banks.filter(b => b.name === getSender(exchange))[0].image} />
                                }
                                {getSender(exchange)}
                            </span>
                            <span>&#10230;</span>
                            <span>
                                {
                                    banks.filter(b => b.name === getReceiver(exchange))[0] && 
                                    <img style={{"flex":"1"}} src={banks.filter(b => b.name === getReceiver(exchange))[0].image} />
                                }
                                {getReceiver(exchange)}
                            </span>
                            <span>
                                <b>{exchange.line_items[0].total}</b>
                                {' '}
                                <small style={{"color": "#7854f7"}}>{exchange.currency}</small>
                            </span>
                        </LastExchangesListItem>
                    )
                    :
                    <Empty emptyText={emptyText} />
                }
            </LastExchangesList>
        </>
        
	);
};

const LastExchangesList = styled.ul`    
    padding: ${({ theme: { sizes } }) => sizes.none};
    margin: ${({ theme: { sizes } }) => sizes.none};
    list-style-type: none;
`;
const LastExchangesListItem = styled.li`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.center};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.start};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.noWrap};
    gap: ${({ theme: { sizes } }) => sizes.xsmall};
    background-color: ${({ theme: { colors } }) => props => props.index % 2 === 0 ? 'rgba(0,0,0,0.025)' : colors.white};
    border-bottom: ${props => props.index % 2 === 0 ? '1px #f0f0f0 solid' : 0};
    padding: 0.9rem;
    line-height: 1.2;
    & > span {
        flex:3;
        & > img {
            width: ${({ theme: { sizes } }) => sizes.large};
            margin-right: ${({ theme: { sizes } }) => sizes.xsmall};
        }
        &:nth-child(3) {
            flex:1;
            text-align: left;
        }
        &:last-child {
            flex:2;
            text-align: right;
        }
    }
    @media (max-width: 767.98px) {
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
        & > span {
            flex:1;
            &:first-child {
                flex:none;
                width: 100%;
                border-bottom: 1px #f0f0f0 solid;
                padding-bottom: .25rem;
                margin-bottom: .5rem;
            }
            &:nth-child(2) {
                flex:3;
            }
            &:nth-child(3) {
                flex:1;
                text-align: center;
            }
            &:nth-child(4) {
                flex:none;
                width: 100%;
            }
            &:last-child {
                flex:none;
                width: 100%;
            }
        }
    }
`;

const mapStateToProps = (state) => {
    return {
        isLoaderOpen: state.loader.isOpen
    };
}

export default connect(mapStateToProps)(React.memo(LastExchanges));