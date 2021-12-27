import React from 'react';
import { extendComponent } from '../component';

function createFeatureHookApplier<FH extends (props: any) => any>(
  useFeature: FH,
  defaultProps?: Partial<Parameters<FH>[0]>
) {
  function applyFeature<C extends React.ElementType<any>>(Component: C) {
    function FeatureAppliedComponent(props: Parameters<FH>[0]) {
      const componentProps = useFeature(props);
      return React.createElement(Component, componentProps);
    }

    extendComponent(FeatureAppliedComponent, Component);
    FeatureAppliedComponent.defaultProps = defaultProps;

    return FeatureAppliedComponent;
  }

  return applyFeature;
}

export default createFeatureHookApplier;
