import {
  createFeaturesContext,
  applyFeaturesContext,
  FindPossibleDependencyKey,
  ConvertToFeatures,
} from '../../utils/framework';
import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';

const usePropsInjection = (map: Record<string, string>) => (props: any, features: any) => ({
  ...props,
  ...Object.fromEntries(Object.entries(map).map(([targetKey, sourceKey]) => [targetKey, features[sourceKey]])),
});

const useCustomerManagementSectionProps = usePropsInjection({
  Table: 'CustomerTable',
});

const useCustomerManagementPageProps = usePropsInjection({
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
  useCustomerManagementPageProps: [useCustomerManagementPageProps, 'useProps', 'useContext'],
  CustomerEditPanel: [CustomerEditPanel, 'useProps'],
});

type CustomerManagementFeatureParams = typeof CustomerManagementContext extends React.Context<
  ConvertToFeatures<infer IFeatureParams>
>
  ? IFeatureParams
  : any;

export const applyCustomerManagement = <TFeatureSource extends (...args: any[]) => any>(
  featureSource: TFeatureSource,
  dependencyKeys: FindPossibleDependencyKey<CustomerManagementFeatureParams, Parameters<TFeatureSource>>,
  isRefNeeded: boolean = false
) => applyFeaturesContext(CustomerManagementContext, featureSource, dependencyKeys, isRefNeeded);

export default CustomerManagementContext;
