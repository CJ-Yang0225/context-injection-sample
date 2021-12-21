import React from 'react';
import styled from '@emotion/styled';

export interface CustomerManagementSectionProps {
  Table: React.FC<IntrinsicElementProps<'table'>>;
}

function CustomerManagementSection(props: CustomerManagementSectionProps) {
  const { Table, ...domProps } = props;

  return (
    <CustomerManagementSectionSelf {...domProps}>
      <Table className="CustomerManagementSection__table" />
    </CustomerManagementSectionSelf>
  );
}

const CustomerManagementSectionSelf = styled.section`
  .CustomerManagementSection__table {
  }
`;

CustomerManagementSection.defaultProps = {
  Table: (props: IntrinsicElementProps<'table'>) => <table {...props} />,
};

export default CustomerManagementSection;
