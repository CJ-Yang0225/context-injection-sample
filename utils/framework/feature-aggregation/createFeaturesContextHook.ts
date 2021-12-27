import React, { useContext as useReactContext } from 'react';
import { UnknownFeatureParams, ConvertToFeatures } from './type';

function createFeaturesContextHook<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  function useFeaturesContext(props: any, ref?: React.Ref<any>) {
    const propsWithRef = { ...props, ref };

    const useProps = () => props;
    const useRef = () => ref;
    const useContext = () => features;
    const usePropsWithRef = () => propsWithRef;

    const features: ConvertToFeatures<TFeatureParams> = {
      ...useReactContext(FeaturesContext),
      __isFeaturesRoot: true,
      __loadedDependencies: {},
      useProps,
      useRef,
      useContext,
      useRefInHook: useRef,
      usePropsWithRefInHook: usePropsWithRef,
    };

    return features;
  }

  return useFeaturesContext;
}

export default createFeaturesContextHook;
