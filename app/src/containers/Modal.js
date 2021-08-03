import styled from 'styled-components';

const Modal = ({ children }) => (
    <Wrapper>
        <Body>
            {children}
        </Body>
    </Wrapper>
);

const Wrapper = styled.div`
    position: fixed;
    left: ${({ theme: { sizes } }) => sizes.none};
    top: ${({ theme: { sizes } }) => sizes.none};
    right: ${({ theme: { sizes } }) => sizes.none};
    bottom: ${({ theme: { sizes } }) => sizes.none};
    background-color: rgba(0,0,0,0.4);
    z-index: 999;
    padding:  ${({ theme: { sizes } }) => sizes.small};
    @media (max-width: 767.98px) {
        position: absolute;
    }
`;
const Body = styled.div`
    box-shadow: 1px 1px 4px rgba(0,0,0,0.15);
    border-radius: 4px;
    max-width: 920px;
    margin: 3% auto;
    padding: ${({ theme: { sizes } }) => sizes.none};
    background-color: ${({ theme: { colors } }) => colors.white};
    @media (max-width: 767.98px) {
        margin: 0 auto;
    }
`;

export default React.memo(Modal);