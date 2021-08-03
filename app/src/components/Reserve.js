const { useState, useEffect } = wp.element;
import { connect } from 'react-redux';
import styled from 'styled-components';
import Block from '../containers/Block';
import Empty from '../components/Empty';
import { toFloat } from '../api/exchange';

const productsFromDOM = Object.values(wpReactAppData.products);

const Reserve = (props) => {

    const {isLoaderOpen, bankReceive} = props;

    const [emptyText, setEmptyText] = useState('');
    useEffect(() => {
        isLoaderOpen 
        ? 
        setEmptyText('Загружается список резервов...')
        :
        setEmptyText('Список резервов')
    }, [isLoaderOpen]);

    const [reserves] = useState(
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

	return (
        <Block>
            <h3>Резерв</h3>
            <ReserveList>
                {   
                    reserves && reserves.length > 0
                    ?
                    reserves.filter(
                        reserve => reserve.stock_quantity !== null
                    ).map(
                        reserve => 
                        <ReserveListItem 
                            key={reserve.id}
                            selected={bankReceive && bankReceive.name.split(' - ')[1] === reserve.name ? true : false}
                        >
                            <img style={{"flex":"1"}} src={reserve.image} />
                            <span style={{"flex":"7"}}>
                                {reserve.name}
                            </span>
                            <small style={{"flex":"2","textAlign":"right"}}>
                                <b>{toFloat(reserve.reserve)}</b>{' '}<small style={{"color": "#7854f7"}} >{reserve.valute}</small>
                            </small>
                        </ReserveListItem>
                    )
                    :
                    <Empty emptyText={emptyText} />
                }
            </ReserveList>
        </Block>
        
	);
};

const ReserveList = styled.ul`    
    height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: ${({ theme: { sizes } }) => sizes.xsmall};
    margin: ${({ theme: { sizes } }) => sizes.none};
`;
const ReserveListItem = styled.li`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.center};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.noWrap};
    gap: ${({ theme: { sizes } }) => sizes.xsmall};
    border: 1px #f0f0f0 solid;
    background-color: ${({ theme: { colors } }) => props => props.selected === true ? colors.light : colors.white};
    margin-bottom: ${({ theme: { sizes } }) => sizes.xsmall};
    padding: 0.7rem;
    line-height: 1.2;
    & > img {
        width: ${({ theme: { sizes } }) => sizes.large};
    }
`;

const mapStateToProps = (state) => {
    return {
        isLoaderOpen: state.loader.isOpen,
        bankReceive: state.bankReceive.bank
    };
}

export default connect(mapStateToProps)(React.memo(Reserve));