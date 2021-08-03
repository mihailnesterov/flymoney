import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

const Loader = (props) => {
	return(
        <Wrapper isOpen={props.isOpen}>
            <Spinner isOpen={props.isOpen} />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    left: ${({ theme: { sizes } }) => sizes.none};
    top: ${({ theme: { sizes } }) => sizes.none};
    right: ${({ theme: { sizes } }) => sizes.none};
    bottom: ${({ theme: { sizes } }) => sizes.none};
    background-color: rgba(255,255,255,0.7);
    z-index: 1000;
`;
const Spinner = styled.div`
    display: ${props => props.isOpen ? 'block' : 'none'};
	margin: auto;
	padding: ${({ theme: { sizes } }) => sizes.none};
    position: absolute;
    left: ${({ theme: { sizes } }) => sizes.none};
    top: ${({ theme: { sizes } }) => sizes.none};
    right: ${({ theme: { sizes } }) => sizes.none};
    bottom: ${({ theme: { sizes } }) => sizes.none};
    z-index:99;
    border: 15px solid ${({ theme: { colors } }) => colors.dark };
    border-top: 15px solid ${({ theme: { colors } }) => colors.light };
    border-radius: 100px;
    width: 50px;
    height: 50px;
    -webkit-animation: spin 1.5s linear infinite; /* Safari */
    animation: spin 1.5s linear infinite;
    opacity: 0.55;

    /* Safari */
    @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
    }

    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }
`;

const mapStateToProps = (state) => {
    return {
        isOpen: state.loader.isOpen
    };
}

export default connect(mapStateToProps)(React.memo(Loader));