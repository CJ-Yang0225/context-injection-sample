import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';
import useCustomerEditingService from './useCustomerEditingService';
import useCustomerEditPanelFeature from './useCustomerEditPanelFeature';
import createFeaturesContextInjectionHook from '../../utils/framework/feature-aggregation/createFeaturesContextInjectionHook';
import createFeaturesContext from '../../utils/framework/feature-aggregation/createFeaturesContext';
import createFeaturesContextApplier from '../../utils/framework/feature-aggregation/createFeaturesContextApplier';
import { modifyComponentStyle } from '../../utils/framework/component';
import createFeatureHookApplier from '../../utils/framework/feature-aggregation/createFeatureHookApplier';
import { FeatureSource } from '../../utils/framework/feature-aggregation/type';

const useCustomerManagementSectionProps = createFeaturesContextInjectionHook({
  Table: 'BorderedCustomerTable',
});

const useCustomerManagementTemplateProps = createFeaturesContextInjectionHook({
  Section: 'CustomerManagementSection',
  EditPanel: 'FeatureAppliedCustomerEditPanel',
});

const BorderedCustomerTable = modifyComponentStyle(CustomerTable, 'CustomerTable--bordered');

const useInjectedCustomerEditPanelFeature = createFeaturesContextApplier(() => CustomerManagementContext)(
  useCustomerEditPanelFeature,
  ['useProps', 'useCustomerStore', 'useCustomerEditingService']
);

const applyCustomerEditPanelFeature = createFeatureHookApplier(useInjectedCustomerEditPanelFeature);

const FeatureAppliedCustomerEditPanel = applyCustomerEditPanelFeature(CustomerEditPanel) as FeatureSource;

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerEditingService: [useCustomerEditingService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'useProps', 'useCustomerService', 'useCustomerEditingService'],
  useCustomerEditPanelFeature: [
    useCustomerEditPanelFeature,
    'useProps',
    'useCustomerStore',
    'useCustomerEditingService',
  ],
  useCustomerManagementSectionProps: [useCustomerManagementSectionProps, 'useProps', 'useContext'],
  useCustomerManagementTemplateProps: [useCustomerManagementTemplateProps, 'useProps', 'useContext'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  CustomerEditPanel: [CustomerEditPanel, 'useCustomerEditPanelFeature'],
  CustomerManagementSection: [CustomerManagementSection, 'useCustomerManagementSectionProps'],

  FeatureAppliedCustomerEditPanel: [FeatureAppliedCustomerEditPanel, 'useProps'],
  BorderedCustomerTable: [BorderedCustomerTable, 'useCustomerTableFeature'],
});

export const applyCustomerManagement = createFeaturesContextApplier(CustomerManagementContext);

export default CustomerManagementContext;
