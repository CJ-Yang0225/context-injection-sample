import { useCallback } from 'react';
import type { CustomerStore } from './useCustomerStore';

export interface CustomerService extends CustomerStore {
  loadCustomers: () => void;
}

const useCustomerService = (customerStore: CustomerStore): CustomerService => {
  const { setCustomers } = customerStore;

  const loadCustomers = useCallback(() => {
    setCustomers(
      Array(5)
        .fill(null)
        .map((_, i) => ({ name: 'sample' + i }))
    );
  }, []);

  return { ...customerStore, loadCustomers };
};

export default useCustomerService;
