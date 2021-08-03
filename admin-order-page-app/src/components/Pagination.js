const { useState, useEffect } = wp.element;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import {
    actionOrdersCountSuccess
} from '../store/actions';

const ordersFromDOM = Object.values(wpReactAdminAppData.orders);

const Pagination = (props) => {

    const {
        count, 
        page, 
        perPage,
        statusFilter,
        orderSearch,
        actionOrdersCountSuccess: setOrdersCountSuccess
    } = props;

    const [pages, setPages] = useState([]);
    const [perPageSelect] = useState([10,20,50,100]);

    useEffect(() => {
        const arrFromPages = [];
        const pagesCount = statusFilter !== '' ? ordersFromDOM.filter(item => item.status === statusFilter).length : count;
        for(let i = 1; i <= Math.ceil(pagesCount / perPage); i++) {
            arrFromPages.push(i);
        }
        setPages(arrFromPages);
    },[count, perPage, statusFilter]);

	return (
        orderSearch === '' &&
        <PaginationBlock>
            <PageSelector>
                {
                    count > 0 &&
                    <ul>
                        {
                            page > 1 &&
                            <li>
                                <Button 
                                    active={false}
                                    onClick={() => setOrdersCountSuccess({
                                        count,
                                        page: (page-1) > 0 ? (page-1) : 1, 
                                        perPage,
                                        error: null
                                    })}
                                >
                                    {'<'}
                                </Button>
                            </li>
                        }
                        {
                            pages.map(
                                item => 
                                <li key={item}>
                                    <Button 
                                        active={item === page ? true : false}
                                        onClick={() => setOrdersCountSuccess({
                                            count,
                                            page: item, 
                                            perPage,
                                            error: null
                                        })}
                                    >
                                            {item}
                                    </Button>
                                </li>
                            )
                        }
                        {
                            page < pages.length &&
                            <li>
                                <Button 
                                    active={false}
                                    onClick={() => setOrdersCountSuccess({
                                        count,
                                        page: (page+1) < Math.ceil(count / perPage) ? (page+1) : Math.ceil(count / perPage), 
                                        perPage,
                                        error: null
                                    })}
                                >
                                    {'>'}
                                </Button>
                            </li>
                        }
                    </ul>
                }
            </PageSelector>
            <PerPageSelector>
                <ul>
                    {
                        perPageSelect.map(
                            item => 
                            <li key={item}>
                                <Button 
                                    active={item === perPage ? true : false}
                                    onClick={() => setOrdersCountSuccess({
                                        count,
                                        page: 1, 
                                        perPage: item,
                                        error: null
                                    })}
                                >
                                    {item}
                                </Button>
                            </li>
                        )
                    }
                </ul>
            </PerPageSelector>
        </PaginationBlock>
	);
};

const PaginationBlock = styled.div`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    gap: ${({ theme: { sizes } }) => sizes.small};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    margin: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.none};
`;
const PageSelector = styled.div`
    flex: ${({ theme: { flex } }) => flex.four};
    @media (max-width: 1199.98px) {
        flex: ${({ theme: { flex } }) => flex.three};
    }
    @media (max-width: 767.98px) {
        flex: ${({ theme: { flex } }) => flex.one};
    }
    & > ul {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.center};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.start};
        gap: ${({ theme: { sizes } }) => sizes.small};
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    }
`;
const PerPageSelector = styled(PageSelector)`
    flex: ${({ theme: { flex } }) => flex.one};
    @media (max-width: 1199.98px) {
        flex: ${({ theme: { flex } }) => flex.two};
    }
    @media (max-width: 767.98px) {
        flex: ${({ theme: { flex } }) => flex.one};
    }
    & > ul {
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.end};
    }
`;
const Button = styled.button`
    background-color: ${
        props => 
        props.active === true ? 
        ({ theme: { colors } }) => colors.badge : 
        ({ theme: { colors } }) => colors.white
    };
    color: ${
        props => 
        props.active === true ? 
        ({ theme: { colors } }) => colors.white : 
        ({ theme: { colors } }) => colors.dark
    };
    padding: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.small};
    border: none;
    outline: none;
    cursor: pointer;
    &:hover
    &:active,
    &:target {
        font-weight: ${({ theme: { fontWeight } }) => fontWeight.bolder};
        background-color: ${({ theme: { colors } }) => colors.badge};
        color: ${({ theme: { colors } }) => colors.white};
    }
`;

const mapStateToProps = (state) => {
    return {
        count: state.ordersCount.count,
        page: state.ordersCount.page,
        perPage: state.ordersCount.perPage,
        statusFilter: state.statusesFilter.status,
        orderSearch: state.orderSearch.search
    };
}

const mapDispatchToProps = dispatch => {
    return {
            dispatch, 
            ...bindActionCreators(
            { 
                actionOrdersCountSuccess
            }, 
            dispatch
        )
    }
};

export default connect( mapStateToProps, mapDispatchToProps )(React.memo(Pagination));