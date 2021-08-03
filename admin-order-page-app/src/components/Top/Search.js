import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import {
    actionOrderSearch,
    actionOrderSearchSuccess,
    actionStatusFilter
} from '../../store/actions';

const Search = (props) => {
    const {
        actionOrderSearch: setOrderSearch,
        actionOrderSearchSuccess: setOrderSearchSuccess,
        actionStatusFilter: setStatusFilter
    } = props;

	return (
        <SearchBlock>
            <SearchInput 
                id="order-search-input"
                type="text"
                placeholder="Найти заявку ..."
                autoComplete="off"
                onChange={(e) => {
                    
                    setStatusFilter();
                    
                    if( e.target.value === '' ) {
                        setOrderSearch();
                    } else {
                        setOrderSearchSuccess({
                            search: e.target.value,
                            error: null
                        });
                    }
                }}
            />
            <ClearButton
                onClick={() => {
                    setOrderSearch(); 
                    document.getElementById("order-search-input").value = "";
                }}
                title="Очистить поиск"
            >&#10540;</ClearButton>
        </SearchBlock>
	);
};

const SearchBlock = styled.div`
    position: relative;
`;

const SearchInput = styled.input`
    color: ${({ theme: { colors } }) => colors.dark};
    justify-self: ${({ theme: { justifyContent } }) => justifyContent.end};
    border-radius: ${({ theme: { borderRadius } }) => borderRadius.medium} !important;
    padding: ${({ theme: { sizes } }) => sizes.xsmall} ${({ theme: { sizes } }) => sizes.medium} !important;
`;

const ClearButton = styled.button`
    position: absolute;
    top: 0.55rem;
    right: ${({ theme: { sizes } }) => sizes.medium};
    z-index: 1000;
    font-size: ${({ theme: { sizes } }) => sizes.medium};
    font-weight: ${({ theme: { fontWeight } }) => fontWeight.bolder};
    color: #909090;
    background-color: ${({ theme: { colors } }) => colors.white};
    padding: ${({ theme: { sizes } }) => sizes.none};
    margin:  ${({ theme: { sizes } }) => sizes.none};
    margin-left:  ${({ theme: { sizes } }) => sizes.small};
    border: ${({ theme: { sizes } }) => sizes.none};
    outline: ${({ theme: { sizes } }) => sizes.none};
    border-radius: ${({ theme: { sizes } }) => sizes.none};
    &:hover {
        color: ${({ theme: { colors } }) => colors.dark};
        background-color: ${({ theme: { colors } }) => colors.white};
        opacity: 0.85;
        cursor: pointer;
    }
    @media (max-width: 767.98px) {
        top: 0.75rem;
    }
`;

const mapDispatchToProps = dispatch => {
    return {
            dispatch, 
            ...bindActionCreators(
            { 
                actionOrderSearch,
                actionOrderSearchSuccess,
                actionStatusFilter
            }, 
            dispatch
        )
    }
};

export default connect( null, mapDispatchToProps )(React.memo(Search));