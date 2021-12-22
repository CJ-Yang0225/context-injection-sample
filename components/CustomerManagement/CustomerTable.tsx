import React from 'react';
import styled from '@emotion/styled';

export interface CustomerTableProps extends IntrinsicElementProps<'table'> {
  data: Customer[];
  onRowSelect: (id: Customer['id']) => void;
}

function CustomerTable(props: CustomerTableProps) {
  const { data, onRowSelect, ...domProps } = props;

  return (
    <CustomerTableSelf {...domProps}>
      <tbody>
        {data.map(({ id, name }, index) => (
          <tr key={index} onClick={() => onRowSelect(id)}>
            <td>{name}</td>
          </tr>
        ))}
      </tbody>
    </CustomerTableSelf>
  );
}

const CustomerTableSelf = styled.table``;

export default CustomerTable;
