import {
  createFeaturesContext,
  applyFeaturesContext,
  ConvertToFeatures,
  FindPossibleDependencyKeys,
} from '../../utils/framework';

import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';

const feature = {
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'useProps', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  CustomerManagementSection: [CustomerManagementSection, 'useProps', 'useFeaturesContext'],
} as const;

const CustomerManagementContext = createFeaturesContext(feature);

export type CustomerManagementFeatures = ConvertToFeatures<typeof feature>;

export const applyCustomerManagement = <TFeature extends (...deps: any) => any>(
  performFeature: TFeature,
  dependencyKeys: FindPossibleDependencyKeys<typeof feature, Parameters<TFeature>>
) => applyFeaturesContext(CustomerManagementContext, performFeature, dependencyKeys);

export default CustomerManagementContext;
