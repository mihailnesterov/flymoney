import React from 'react';
import styled from 'styled-components';

const Empty = ({emptyText}) => {
	return(
        <EmptyListItem>{emptyText}</EmptyListItem>
    );
};
const EmptyListItem = styled.li`
    text-align: ${({ theme: { textAlign } }) => textAlign.center} !important;
    background-color: #f9f9f9 !important;
    color: #222 !important;
    padding: ${({ theme: { sizes } }) => sizes.medium} !important;
    margin: ${({ theme: { sizes } }) => sizes.xsmall} -${({ theme: { sizes } }) => sizes.xsmall} 0 0 !important;
`;

export default React.memo(Empty);