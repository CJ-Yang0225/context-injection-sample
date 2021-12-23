import { createFeaturesContext, useFeaturePropsInjection, createFeaturesContextApplier } from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';
import useCustomerEditingService from './useCustomerEditingService';
import useCustomerEditPanelFeature from './useCustomerEditPanelFeature';

const useCustomerManagementSectionProps = useFeaturePropsInjection({
  Table: 'CustomerTable',
});

const useCustomerManagementTemplateProps = useFeaturePropsInjection({
  Section: 'CustomerManagementSection',
  EditPanel: 'CustomerEditPanel',
});

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerEditingService: [useCustomerEditingService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'useProps', 'useCustomerStore', 'useCustomerEditingService'],
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
});

export const applyCustomerManagement = createFeaturesContextApplier(CustomerManagementContext);

export default CustomerManagementContext;
