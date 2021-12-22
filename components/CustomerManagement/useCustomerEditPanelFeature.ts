import { CustomerEditPanelProps } from './CustomerEditPanel';
import { CustomerEditingService } from './useCustomerEditingService';

const useCustomerEditPanelFeature = (
  props: CustomerEditPanelProps,
  customerEditingService: CustomerEditingService
): CustomerEditPanelProps => {
  const { editingCustomer, setEditingCustomer } = customerEditingService;

  const handleChange = (name: keyof Customer, value: Customer[typeof name]) => {
    setEditingCustomer((customer) => customer && { ...customer, [name]: value });
  };

  return { ...props, data: editingCustomer, onChange: handleChange };
};

export default useCustomerEditPanelFeature;
