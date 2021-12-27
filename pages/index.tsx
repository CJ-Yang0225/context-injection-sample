import {
  applyCustomerManagement,
  shareCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate from '../components/CustomerManagement/CustomerManagementTemplate';

export default shareCustomerManagement(
  applyCustomerManagement(CustomerManagementTemplate, ['useCustomerManagementTemplateProps']),
  ['useCustomerStore', 'useCustomerService', 'useCustomerEditingService']
);
