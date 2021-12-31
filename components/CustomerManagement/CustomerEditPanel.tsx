import React from 'react';
import styled from '@emotion/styled';
import { applyFastRefresh } from '../../utils/framework/component';

export interface CustomerEditPanelProps extends IntrinsicElementProps<'div'> {
  data: Customer | null;
  onInputChange: (name: keyof Customer, value: Customer[typeof name]) => void;
  onButtonClick: () => void;
}

function CustomerEditPanel(props: CustomerEditPanelProps) {
  const { data, onInputChange, onButtonClick, ...domProps } = props;

  return (
    <CustomerEditPanelSelf {...domProps}>
      <input
        type="text"
        className="CustomerEditPanel__name-input"
        value={data?.name || ''}
        onChange={(e) => onInputChange('name', e.target.value)}
      />
      <button className="CustomerEditPanel__button" onClick={onButtonClick}>
        完成更改
      </button>
    </CustomerEditPanelSelf>
  );
}

const CustomerEditPanelSelf = styled.div`
  .CustomerEditPanel__name-input {
  }

  .CustomerEditPanel__button {
  }
`;

export default CustomerEditPanel;
