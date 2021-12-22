import { createFeaturesContext, applyFeaturesContext, FindPossibleDependencyKey } from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';

const solveSectionProps = (props: any, { CustomerTable }: any) => ({ ...props, Table: CustomerTable });

const solvePageProps = (props: any, { CustomerManagementSection, CustomerEditPanel }: any) => ({
  ...props,
  Section: CustomerManagementSection,
  EditPanel: CustomerEditPanel,
});

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'usePropsWithRefInHook', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  solveCustomerManagementSectionProps: [solveSectionProps, 'useProps', 'useContext'],
  CustomerManagementSection: [CustomerManagementSection, 'solveCustomerManagementSectionProps'],
  solveCustomerManagementPageProps: [solvePageProps, 'useProps', 'useContext'],
  CustomerEditPanel: [CustomerEditPanel, 'useProps'],
});

export const applyCustomerManagement = applyFeaturesContext.bind<null, typeof CustomerManagementContext, any, any>(
  null,
  CustomerManagementContext
);

export default CustomerManagementContext;
