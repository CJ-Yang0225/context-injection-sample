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
import React from 'react';

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'useProps', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  CustomerManagementSection: [CustomerManagementSection, 'useProps', 'useFeaturesContext'],
});

type CustomerManagementFeatures = typeof CustomerManagementContext extends React.Context<infer Features>
  ? Features
  : any;

type CustomerManagementFeatureParams = CustomerManagementFeatures extends ConvertToFeatures<infer FeatureParams>
  ? FeatureParams
  : any;

export const applyCustomerManagement = <TFeature extends (...deps: any) => any>(
  performFeature: TFeature,
  dependencyKeys: FindPossibleDependencyKey<CustomerManagementFeatureParams, Parameters<TFeature>>
) => applyFeaturesContext(CustomerManagementContext, performFeature, dependencyKeys);

export default CustomerManagementContext;
