import React from 'react';
import styled from '@emotion/styled';

export interface CustomerEditPanelProps extends IntrinsicElementProps<'div'> {}

function CustomerEditPanel(props: CustomerEditPanelProps) {
  const { ...domProps } = props;
  return <CustomerEditPanelSelf {...domProps}></CustomerEditPanelSelf>;
}

const CustomerEditPanelSelf = styled.div``;

export default CustomerEditPanel;
