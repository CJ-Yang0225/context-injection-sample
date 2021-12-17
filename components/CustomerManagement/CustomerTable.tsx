import React from 'react';
import styled from '@emotion/styled';

export interface CustomerTableProps extends IntrinsicElementProps<'table'> {
  data: Customer[];
}

function CustomerTable(props: CustomerTableProps) {
  const { data, ...domProps } = props;
  return (
    <CustomerTableSelf {...domProps}>
      <tbody>
        {data.map(({ name }, index) => (
          <tr key={index}>
            <td>{name}</td>
          </tr>
        ))}
      </tbody>
    </CustomerTableSelf>
  );
}

const CustomerTableSelf = styled.table``;

export default CustomerTable;
