import type { CustomerEditPanelProps } from './CustomerEditPanel';
import type { CustomerEditingService } from './useCustomerEditingService';
import type { CustomerStore } from './useCustomerStore';

const useCustomerEditPanelFeature = (
  props: CustomerEditPanelProps,
  customerStore: CustomerStore,
  customerEditingService: CustomerEditingService
): CustomerEditPanelProps => {
  const { setCustomers } = customerStore;
  const { editingCustomer, setEditingCustomer } = customerEditingService;

  const handleInputChange = (name: keyof Customer, value: Customer[typeof name]) => {
    setEditingCustomer((customer) => customer && { ...customer, [name]: value });
  };

  const handleButtonClick = () => {
    if (editingCustomer) {
      setCustomers(([...customers]) => {
        const index = customers.findIndex((customer) => customer.id === editingCustomer.id);
        customers[index] = editingCustomer;
        return customers;
      });
    }
  };

  return { ...props, data: editingCustomer, onInputChange: handleInputChange, onButtonClick: handleButtonClick };
};

export default useCustomerEditPanelFeature;
