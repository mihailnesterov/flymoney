import styled from 'styled-components';

const BanksList = ({ children }) => (
    <List>{children}</List>
);

const List = styled.ul`
    height: 435px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: ${({ theme: { sizes } }) => sizes.xsmall};
    margin: ${({ theme: { sizes } }) => sizes.none};
    & > li {
        display: ${({ theme: { display } }) => display.flex};
        align-items: ${({ theme: { alignItems } }) => alignItems.center};
        justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
        flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
        gap: ${({ theme: { sizes } }) => sizes.xsmall};
        border: 1px #f0f0f0 solid;
        background-color: ${({ theme: { colors } }) => colors.white};
        margin-bottom: ${({ theme: { sizes } }) => sizes.xsmall};
        padding: ${({ theme: { sizes } }) => sizes.none};
        &:first-child {
            margin-top: ${({ theme: { sizes } }) => sizes.xsmall};
        }
    }
    @media (max-width: 767.98px) {
        height: auto;
        overflow-y: unset;
        overflow-x: unset;
    }
`;

export default React.memo(BanksList);