import React from 'react';
import { isValidRef } from '../ref';
import { UnknownFeatureParams, ConvertToFeatures } from './type';
import createFeaturesContextHook from './createFeaturesContextHook';

function useSharedDependencySolver<TFeatureParams extends UnknownFeatureParams>(
  features: ConvertToFeatures<TFeatureParams>,
  props: any,
  ref?: React.Ref<any>
) {
  const useSharedDependencySolver = (dependencyKey: keyof TFeatureParams) => {
    const useDependency = features[dependencyKey];
    const dependency = useDependency(props, ref, features);
    features.__loadedDependencies[dependencyKey] = dependency;
  };

  return useSharedDependencySolver;
}

function createFeaturesContextSharer<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  const useFeaturesContext = createFeaturesContextHook(FeaturesContext);

  function shareFeaturesContext(Component: React.ElementType, dependencyKeys: (keyof TFeatureParams)[]) {
    const FeaturesSharedComponent = (props: any, ref?: React.Ref<any>) => {
      const features = useFeaturesContext(props, ref);
      const sharedFeatures = {} as ConvertToFeatures<TFeatureParams>;

      dependencyKeys.forEach(useSharedDependencySolver(features, props, ref));

      for (const dependencyKey of dependencyKeys) {
        sharedFeatures[dependencyKey] = (() =>
          features.__loadedDependencies[dependencyKey]) as ConvertToFeatures<TFeatureParams>[keyof TFeatureParams];
      }

      const children = React.createElement(Component, { ...props, ref: isValidRef(ref) ? ref : void 0 });

      return React.createElement(FeaturesContext.Provider, { value: { ...features, ...sharedFeatures }, children });
    };

    return FeaturesSharedComponent;
  }

  return shareFeaturesContext;
}

export default createFeaturesContextSharer;
