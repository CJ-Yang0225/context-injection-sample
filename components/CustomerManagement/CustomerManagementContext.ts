import { createFeaturesContext, usePropsInjection, createFeaturesContextApplier } from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';

const useCustomerManagementSectionProps = usePropsInjection({
  Table: 'CustomerTable',
});

const useCustomerManagementTemplateProps = usePropsInjection({
  Section: 'CustomerManagementSection',
  EditPanel: 'CustomerEditPanel',
});

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'usePropsWithRefInHook', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  useCustomerManagementSectionProps: [useCustomerManagementSectionProps, 'useProps', 'useContext'],
  CustomerManagementSection: [CustomerManagementSection, 'useCustomerManagementSectionProps'],
  useCustomerManagementTemplateProps: [useCustomerManagementTemplateProps, 'useProps', 'useContext'],
  CustomerEditPanel: [CustomerEditPanel, 'useProps'],
});

export const applyCustomerManagement = createFeaturesContextApplier(CustomerManagementContext);

export default CustomerManagementContext;
