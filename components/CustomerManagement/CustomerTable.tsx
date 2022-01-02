import React from 'react';
import styled from '@emotion/styled';
import { combineRefProp } from '../../utils/framework/component';

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
          <tr className="CustomerTable__row" key={index} onClick={() => onRowSelect(id)}>
            <td className="CustomerTable__column">{name}</td>
          </tr>
        ))}
      </tbody>
    </CustomerTableSelf>
  );
}

const CustomerTableSelf = styled.table`
  &.CustomerTable--bordered {
    border-collapse: collapse;
  }

  &.CustomerTable--bordered .CustomerTable__column {
    border-width: 1px;
    border-style: solid;
  }
`;

export default combineRefProp(CustomerTable);
