import { useCallback, useEffect } from 'react';
import type { CustomerService } from './useCustomerService';
import type { CustomerTableProps } from './CustomerTable';
import { CustomerEditingService } from './useCustomerEditingService';

const useCustomerTableFeature = (
  props: CustomerTableProps,
  customerService: CustomerService,
  customerEditingService: CustomerEditingService
): CustomerTableProps => {
  const { setEditingCustomerId } = customerEditingService;
  const { customers } = customerService;
  const handleRowSelect = useCallback(setEditingCustomerId, []);
  useEffect(customerService.loadCustomers, []);
  return { ...props, data: customers, onRowSelect: handleRowSelect };
};

export default useCustomerTableFeature;
