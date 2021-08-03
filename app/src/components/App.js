import { connect } from 'react-redux';
import styled from 'styled-components';
import Theme from '../themes/default';
import Send from './Send';
import Receive from './Receive';
import Reserve from './Reserve';
import Loader from './Loader';
import Modal from '../containers/Modal';
import Order from './Order';
import Pannel from '../containers/Pannel';
import Customer from './Customer';
import LastExchanges from './LastExchanges';

const App = ({isModalOpen}) => {
	return (
        <Theme>
            <Customer />
            <Wrapper>
                <Loader />
                <Send />
                <Receive />
                <Reserve />
                {
                    isModalOpen &&
                    <Modal>
                        <Order />
                    </Modal>
                }
            </Wrapper>
            <Pannel>
                <LastExchanges />
            </Pannel>
        </Theme>
	);
};

const Wrapper = styled.div`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.start};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    gap: ${({ theme: { sizes } }) => sizes.xlarge};
    padding: 0;
    margin: ${({ theme: { sizes } }) => sizes.small} 0;
    background-color: ${({ theme: { colors } }) => colors.transparent};
    @media (max-width: 1199.98px) {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.start};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    }
    @media (max-width: 767.98px) {
        display: ${({ theme: { display } }) => display.block};
    }
`;

const mapStateToProps = (state) => {
    return {
        isModalOpen: state.modal.isOpen
    };
}

export default connect(mapStateToProps)(React.memo(App));