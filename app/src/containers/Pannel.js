import styled from 'styled-components';

const Pannel = ({ children }) => (
    children &&
    <Content>{children}</Content>
);

const Content = styled.div`
    flex: ${({ theme: { flex } }) => flex.one};
    box-shadow: 2px 2px 10px #d8dde5;
    padding: ${({ theme: { sizes } }) => sizes.medium};
    margin:  ${({ theme: { sizes } }) => sizes.none};
    background-color: ${({ theme: { colors } }) => colors.white};
    & > H3 {
        color: ${({ theme: { colors } }) => colors.dark};
        border-bottom: 1px ${({ theme: { colors } }) => colors.light} solid;
        padding-bottom: ${({ theme: { sizes } }) => sizes.xsmall};
    }
`;

export default React.memo(Pannel);