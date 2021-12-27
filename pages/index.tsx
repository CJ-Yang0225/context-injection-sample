import CustomerManagementContext, {
  applyCustomerManagement,
} from '../components/CustomerManagement/CustomerManagementContext';

import CustomerManagementTemplate from '../components/CustomerManagement/CustomerManagementTemplate';

import { shareFeaturesContext } from '../utils/framework';

export default shareFeaturesContext(
  CustomerManagementContext,
  applyCustomerManagement(CustomerManagementTemplate, ['useCustomerManagementTemplateProps']),
  ['useCustomerStore', 'useCustomerService', 'useCustomerEditingService']
);
