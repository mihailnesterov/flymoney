import styled from 'styled-components';
import Theme from '../themes/default';
import Top from './Top';
import Orders from './Orders';

const App = () => {
	return (
        <Theme>
            <Wrapper>
                <Top />
                <Orders />
            </Wrapper>
        </Theme>
	);
};

const Wrapper = styled.div`
    background-color: ${({ theme: { colors } }) => colors.white};
    border: 1px ${({ theme: { colors } }) => colors.light} solid;
    margin-top: ${({ theme: { sizes } }) => sizes.medium};
    margin-right: ${({ theme: { sizes } }) => sizes.medium};
    margin-bottom: ${({ theme: { sizes } }) => sizes.medium};
    padding: ${({ theme: { sizes } }) => sizes.medium};
    @media (max-width: 767.98px) {
        margin-left: ${({ theme: { sizes } }) => sizes.xsmall};
    }
`;

export default React.memo(App);