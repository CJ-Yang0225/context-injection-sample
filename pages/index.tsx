import React from 'react';
import styled from '@emotion/styled';
import { applyCustomerManagement } from '../components/CustomerManagement/CustomerManagementContext';

export interface CustomerManagementPageProps {
  Section: React.FC<IntrinsicElementProps<'section'>>;
  EditPanel: React.FC<IntrinsicElementProps<'div'>>;
}

function CustomerManagementPage(props: CustomerManagementPageProps) {
  const { Section, EditPanel, ...domProps } = props;

  return (
    <CustomerManagementPageSelf {...domProps}>
      <Section className="CustomerManagementPage__section" />
      <EditPanel className="CustomerManagementPage__edit-panel" />
    </CustomerManagementPageSelf>
  );
}

const CustomerManagementPageSelf = styled.div``;

CustomerManagementPage.defaultProps = {
  Section: (props: IntrinsicElementProps<'section'>) => <section {...props} />,
  EditPanel: (props: IntrinsicElementProps<'div'>) => <div {...props} />,
};

export default applyCustomerManagement(CustomerManagementPage, ['solveCustomerManagementPageProps']);
