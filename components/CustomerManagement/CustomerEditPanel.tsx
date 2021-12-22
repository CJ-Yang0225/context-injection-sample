import React from 'react';
import styled from '@emotion/styled';

export interface CustomerEditPanelProps extends Omit<IntrinsicElementProps<'div'>, 'onChange'> {
  data: Customer | null;
  onChange: (name: keyof Customer, value: Customer[typeof name]) => void;
}

function CustomerEditPanel(props: CustomerEditPanelProps) {
  const { data, onChange, ...domProps } = props;

  return (
    <CustomerEditPanelSelf {...domProps}>
      <input
        type="text"
        className="CustomerEditPanel__name-input"
        value={data?.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
      />
    </CustomerEditPanelSelf>
  );
}

const CustomerEditPanelSelf = styled.div`
  .CustomerEditPanel__name-input {
  }
`;

export default CustomerEditPanel;
