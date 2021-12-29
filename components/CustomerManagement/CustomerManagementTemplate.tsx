import React from 'react';
import styled from '@emotion/styled';

export interface CustomerManagementTemplateProps extends IntrinsicElementProps<'main'> {
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

const CustomerManagementTemplateSelf = styled.main``;

CustomerManagementTemplate.defaultProps = {
  Section: 'section',
  EditPanel: React.createElement.bind(React, 'div'),
};

export default CustomerManagementTemplate;
