import React, { useEffect } from 'react';

import CustomerManagementContext, {
  applyCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate, {
  CustomerManagementTemplateProps,
} from '../components/CustomerManagement/CustomerManagementTemplate';

import { useDependencySolver, useFeaturesRoot } from '../utils/framework';

const OverwrittenCustomerManagementTemplate = (props: CustomerManagementTemplateProps): JSX.Element => {
  const features = useFeaturesRoot(CustomerManagementContext, props);
  const { useCustomerEditingService, useCustomerService } = features;
  const customerService = useCustomerService(props, null, features);
  features.__featuresContextCache!['useCustomerEditingService'] = useCustomerEditingService(props, null, features);

  const overwrittenFeatures = {
    ...features,
    useCustomerStore: () => useDependencySolver(features, props)('useCustomerStore'),
    useCustomerEditingService: () => useDependencySolver(features, props)('useCustomerEditingService'),
  };

  console.log(overwrittenFeatures);

  useEffect(customerService.loadCustomers, []);

  return (
    <CustomerManagementContext.Provider value={overwrittenFeatures}>
      <CustomerManagementTemplate {...props} />
    </CustomerManagementContext.Provider>
  );
};

export default applyCustomerManagement(OverwrittenCustomerManagementTemplate, ['useCustomerManagementTemplateProps']);
