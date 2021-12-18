import {
  createFeaturesContext,
  applyFeaturesContext,
  ConvertToFeatures,
  FindPossibleDependencyKey,
} from '../../utils/framework';

import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';

const featureParams = {
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'useProps', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  CustomerManagementSection: [CustomerManagementSection, 'useProps', 'useFeaturesContext'],
} as const;

const CustomerManagementContext = createFeaturesContext(featureParams);

type CustomerManagementFeatureParams = typeof featureParams;

export type CustomerManagementFeatures = ConvertToFeatures<CustomerManagementFeatureParams>;

export const applyCustomerManagement = <TFeature extends (...deps: any) => any>(
  performFeature: TFeature,
  dependencyKeys: FindPossibleDependencyKey<CustomerManagementFeatureParams, Parameters<TFeature>>
) => applyFeaturesContext(CustomerManagementContext, performFeature, dependencyKeys);

export default CustomerManagementContext;
