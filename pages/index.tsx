import React from 'react';
import styled from '@emotion/styled';
import {
  applyCustomerManagement,
  CustomerManagementFeatures,
} from '../components/CustomerManagement/CustomerManagementContext';

export interface CustomerManagementPageProps {}

function CustomerManagementPage(props: CustomerManagementPageProps, features: CustomerManagementFeatures) {
  console.log(features);

  return (
    <CustomerManagementPageSelf {...props}>
      <features.CustomerManagementSection />
    </CustomerManagementPageSelf>
  );
}

const CustomerManagementPageSelf = styled.div``;

export default applyCustomerManagement(CustomerManagementPage, ['useProps', 'useFeaturesContext']);
