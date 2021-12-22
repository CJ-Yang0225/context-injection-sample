import { useEffect, useState } from 'react';
import { CustomerStore } from './useCustomerStore';

export interface CustomerEditingService {
  editingCustomer: Customer | null;
  editingCustomerId: Customer['id'];
  setEditingCustomer: (customer: Customer | null | ((customer: Customer | null) => Customer | null)) => void;
  setEditingCustomerId: (customers: Customer['id'] | ((customers: Customer['id']) => Customer['id'])) => void;
}

const useCustomerEditingService = (customerStore: CustomerStore): CustomerEditingService => {
  const { customers } = customerStore;
  const [editingCustomerId, setEditingCustomerId] = useState('');

  const [editingCustomer, setEditingCustomer] = useState(
    customers.find((customer) => customer.id === editingCustomerId) || null
  );

  useEffect(() => {
    setEditingCustomer(customers.find((customer) => customer.id === editingCustomerId) || null);
  }, [customers, editingCustomerId]);

  return { editingCustomerId, setEditingCustomerId, editingCustomer, setEditingCustomer };
};

export default useCustomerEditingService;
