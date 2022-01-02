import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';
import useCustomerEditingService from './useCustomerEditingService';
import useCustomerEditPanelFeature from './useCustomerEditPanelFeature';
import createFeatureContextInjectionHook from '../../utils/framework/feature-aggregation/createFeatureContextInjectionHook';
import createFeatureContext from '../../utils/framework/feature-aggregation/createFeatureContext';
import createFeatureContextApplier from '../../utils/framework/feature-aggregation/createFeatureContextApplier';
import { addClassNameProp } from '../../utils/framework/component';
import createFeatureHookApplier from '../../utils/framework/feature-aggregation/createFeatureHookApplier';
import { FeatureSource } from '../../utils/framework/feature-aggregation/type';
import createFeatureContextSharer from '../../utils/framework/feature-aggregation/createFeatureContextSharer';

const useCustomerManagementSectionProps = createFeatureContextInjectionHook({
  Table: 'BorderedCustomerTable',
});

const useCustomerManagementTemplateProps = createFeatureContextInjectionHook({
  Section: 'CustomerManagementSection',
  EditPanel: 'FeatureAppliedCustomerEditPanel',
});

const BorderedCustomerTable = addClassNameProp(CustomerTable, 'CustomerTable--bordered');

const useInjectedCustomerEditPanelFeature = createFeatureContextApplier(() => CustomerManagementContext)(
  useCustomerEditPanelFeature,
  ['useProps', 'useCustomerStore', 'useCustomerEditingService']
);

const applyCustomerEditPanelFeature = createFeatureHookApplier(useInjectedCustomerEditPanelFeature);

const FeatureAppliedCustomerEditPanel = applyCustomerEditPanelFeature(CustomerEditPanel) as FeatureSource;

const CustomerManagementContext = createFeatureContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerEditingService: [useCustomerEditingService, 'useCustomerStore'],
  useCustomerTableFeature: [
    useCustomerTableFeature,
    'usePropsWithRef',
    'useCustomerService',
    'useCustomerEditingService',
  ],
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

export const applyCustomerManagement = createFeatureContextApplier(CustomerManagementContext);

export const shareCustomerManagement = createFeatureContextSharer(CustomerManagementContext);

export default CustomerManagementContext;
