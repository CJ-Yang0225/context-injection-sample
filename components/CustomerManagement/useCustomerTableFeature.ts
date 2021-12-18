import { useEffect } from 'react';
import type { CustomerService } from './useCustomerService';
import type { CustomerTableProps } from './CustomerTable';

const useCustomerTableFeature = (props: CustomerTableProps, customerService: CustomerService): CustomerTableProps => {
  const { customers, loadCustomers } = customerService;

  useEffect(loadCustomers, []);

  return { ...props, data: customers };
};

export default useCustomerTableFeature;
