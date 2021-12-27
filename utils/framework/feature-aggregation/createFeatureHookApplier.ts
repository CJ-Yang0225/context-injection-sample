import React from 'react';
import { extendComponent } from '../component';

export function createFeatureHookApplier<FH extends (props: any) => {}>(
  useFeature: FH,
  defaultProps?: Partial<Parameters<FH>[0]>
) {
  function applyFeature<C extends React.VFC>(Component: C) {
    function FeatureAppliedComponent(props: Parameters<FH>[0]) {
      const componentProps = useFeature(props);
      return Component(componentProps);
    }

    extendComponent(FeatureAppliedComponent, Component);
    FeatureAppliedComponent.defaultProps = defaultProps;

    return FeatureAppliedComponent;
  }

  return applyFeature;
}

export default createFeatureHookApplier;
