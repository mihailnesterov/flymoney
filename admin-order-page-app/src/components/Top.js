import styled from 'styled-components';
import Counters from './Top/Counters';
import Search from './Top/Search';

const Top = () => {
	return (
        <Header>
            <h1>Заявки на обмен</h1>
            <Counters />
            <Search />
        </Header>
	);
};

const Header = styled.header`
    display: ${({ theme: { display } }) => display.flex};
    align-items: ${({ theme: { alignItems } }) => alignItems.center};
    justify-content: ${({ theme: { justifyContent } }) => justifyContent.between};
    gap: ${({ theme: { sizes } }) => sizes.large};
    flex-wrap: ${({ theme: { flexWrap } }) => flexWrap.wrap};
    margin-bottom: ${({ theme: { sizes } }) => sizes.large};
    & > h1 {
        font-weight: ${({ theme: { fontWeight } }) => fontWeight.lighter};
    }
`;

export default React.memo(Top);