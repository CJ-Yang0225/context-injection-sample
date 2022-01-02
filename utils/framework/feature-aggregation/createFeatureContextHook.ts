import React, { useContext as useReactContext } from 'react';
import { UnknownFeatureParams, ConvertToFeatures } from './types';

function createFeatureContextHook<TFeatureParams extends UnknownFeatureParams>(
  FeatureContext:
    | React.Context<ConvertToFeatures<TFeatureParams>>
    | (() => React.Context<ConvertToFeatures<TFeatureParams>>)
) {
  const getFeatureContext = typeof FeatureContext === 'function' ? FeatureContext : () => FeatureContext;

  function useFeatureContext(props: any, ref?: React.Ref<any>) {
    const propsWithRef = { ...props, ref };

    const useProps = () => props;
    const useRef = () => ref;
    const useContext = () => features;
    const usePropsWithRef = () => propsWithRef;

    const features: ConvertToFeatures<TFeatureParams> = {
      ...useReactContext(getFeatureContext()),
      __isFeaturesRoot: true,
      __loadedDependencies: {},
      useProps,
      useRef,
      useContext,
      usePropsWithRef,
    };

    return features;
  }

  return useFeatureContext;
}

export default createFeatureContextHook;
