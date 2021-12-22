import React, { useContext, useEffect } from 'react';

import CustomerManagementContext, {
  applyCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate, {
  CustomerManagementTemplateProps,
} from '../components/CustomerManagement/CustomerManagementTemplate';

const OverwrittenCustomerManagementTemplate = (props: CustomerManagementTemplateProps): JSX.Element => {
  const features = useContext(CustomerManagementContext);
  const { useCustomerService, useCustomerEditingService } = features;
  const customerService = useCustomerService();
  const customerEditingService = useCustomerEditingService(null, null, {
    __isFeaturesContext: true,
    __featuresContextCache: { useCustomerStore: customerService },
  });

  const overwrittenFeatures = {
    ...features,
    useCustomerStore: () => customerService,
    useCustomerService: () => customerService,
    useCustomerEditingService: () => customerEditingService,
  };

  useEffect(customerService.loadCustomers, []);

  return (
    <CustomerManagementContext.Provider value={overwrittenFeatures}>
      <CustomerManagementTemplate {...props} />
    </CustomerManagementContext.Provider>
  );
};

export default applyCustomerManagement(OverwrittenCustomerManagementTemplate, ['useCustomerManagementTemplateProps']);
