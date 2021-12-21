import { createFeaturesContext, applyFeaturesContext, FindPossibleDependencyKey } from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';

const solveSectionProps = (props: any, { CustomerTable }: any) => ({ Table: CustomerTable, ...props });

const solvePageProps = (props: any, { CustomerManagementSection }: any) => ({
  Section: CustomerManagementSection,
  ...props,
});

const CustomerManagementContext = createFeaturesContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerTableFeature: [useCustomerTableFeature, 'usePropsWithRefInHook', 'useCustomerService'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  solveCustomerManagementSectionProps: [solveSectionProps, 'useProps', 'useFeaturesContext'],
  CustomerManagementSection: [CustomerManagementSection, 'solveCustomerManagementSectionProps'],
  solveCustomerManagementPageProps: [solvePageProps, 'useProps', 'useFeaturesContext'],
});

export const applyCustomerManagement = applyFeaturesContext.bind<null, typeof CustomerManagementContext, any, any>(
  null,
  CustomerManagementContext
);

export default CustomerManagementContext;
