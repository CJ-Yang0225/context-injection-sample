import React from 'react';
import styled from '@emotion/styled';

export interface CustomerManagementTemplateProps {
  Section: 'section' | React.FC<IntrinsicElementProps<'section'>>;
  EditPanel: 'div' | React.FC<IntrinsicElementProps<'div'>>;
}

function CustomerManagementTemplate(props: CustomerManagementTemplateProps) {
  const { Section, EditPanel, ...domProps } = props;

  return (
    <CustomerManagementTemplateSelf {...domProps}>
      <Section className="CustomerManagementTemplate__section" />
      <EditPanel className="CustomerManagementTemplate__edit-panel" />
    </CustomerManagementTemplateSelf>
  );
}

const CustomerManagementTemplateSelf = styled.div``;

CustomerManagementTemplate.defaultProps = {
  Section: 'section',
  EditPanel: 'div',
};

export default CustomerManagementTemplate;
