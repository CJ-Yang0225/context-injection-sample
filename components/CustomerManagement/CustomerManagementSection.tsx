import React from 'react';
import styled from '@emotion/styled';
import type { CustomerManagementFeatures } from './CustomerManagementContext';

export interface CustomerManagementSectionProps {}

function CustomerManagementSection(props: CustomerManagementSectionProps, features: CustomerManagementFeatures) {
  return (
    <CustomerManagementSectionSelf {...props}>
      <features.CustomerTable />
    </CustomerManagementSectionSelf>
  );
}

const CustomerManagementSectionSelf = styled.section``;

export default CustomerManagementSection;
