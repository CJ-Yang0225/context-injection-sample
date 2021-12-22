import { useCallback } from 'react';
import type { CustomerStore } from './useCustomerStore';
import type { CustomerTableProps } from './CustomerTable';
import { CustomerEditingService } from './useCustomerEditingService';

const useCustomerTableFeature = (
  props: CustomerTableProps,
  customerStore: CustomerStore,
  customerEditingService: CustomerEditingService
): CustomerTableProps => {
  const { setEditingCustomerId } = customerEditingService;
  const { customers } = customerStore;
  const handleRowSelect = useCallback(setEditingCustomerId, []);
  return { ...props, data: customers, onRowSelect: handleRowSelect };
};

export default useCustomerTableFeature;
