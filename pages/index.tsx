import CustomerManagementContext, {
  applyCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate from '../components/CustomerManagement/CustomerManagementTemplate';

import { shareFeaturesRoot } from '../utils/framework';

export default shareFeaturesRoot(
  CustomerManagementContext,
  applyCustomerManagement(CustomerManagementTemplate, ['useCustomerManagementTemplateProps']),
  ['useCustomerStore', 'useCustomerService', 'useCustomerEditingService']
);
