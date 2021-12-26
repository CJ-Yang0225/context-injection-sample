import CustomerManagementContext, {
  applyCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate from '../components/CustomerManagement/CustomerManagementTemplate';

import { shareFeatures } from '../utils/framework';

export default shareFeatures(
  CustomerManagementContext,
  applyCustomerManagement(CustomerManagementTemplate, ['useCustomerManagementTemplateProps']),
  ['useCustomerStore', 'useCustomerService', 'useCustomerEditingService']
);
