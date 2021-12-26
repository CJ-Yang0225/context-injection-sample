import { createFeaturesContext, useFeaturesPropsInjection, createFeaturesContextApplier } from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable, { CustomerTableProps } from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';
import useCustomerEditingService from './useCustomerEditingService';
import useCustomerEditPanelFeature from './useCustomerEditPanelFeature';

const useCustomerManagementSectionProps = useFeaturesPropsInjection({
  Table: 'BorderedCustomerTable',
});

const useCustomerManagementTemplateProps = useFeaturesPropsInjection({
  Section: 'CustomerManagementSection',
  EditPanel: 'CustomerEditPanel',
});

const useBorderedCustomerTableFeature = (props: CustomerTableProps) => ({
  ...props,
  className: (props.className ? props.className.split(' ') : []).concat(['CustomerTable--bordered']).join(' '),
});

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

  useBorderedCustomerTableFeature: [useBorderedCustomerTableFeature, 'useCustomerTableFeature'],
  BorderedCustomerTable: [CustomerTable, 'useBorderedCustomerTableFeature'],
});

export const applyCustomerManagement = createFeaturesContextApplier(CustomerManagementContext);

export default CustomerManagementContext;
