import React from 'react';
import { isValidRef } from '../ref';
import { UnknownFeatureParams, ConvertToFeatures } from './types';
import createFeatureContextHook from './createFeatureContextHook';

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

function createFeatureContextSharer<TFeatureParams extends UnknownFeatureParams>(
  FeatureContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  const useFeatureContext = createFeatureContextHook(FeatureContext);

  function shareFeatureContext(Component: React.ElementType, dependencyKeys: (keyof TFeatureParams)[]) {
    const FeaturesSharedComponent = (props: any, ref?: React.Ref<any>) => {
      const features = useFeatureContext(props, ref);
      const sharedFeatures = {} as ConvertToFeatures<TFeatureParams>;

      dependencyKeys.forEach(useSharedDependencySolver(features, props, ref));

      for (const dependencyKey of dependencyKeys) {
        sharedFeatures[dependencyKey] = (() =>
          features.__loadedDependencies[dependencyKey]) as ConvertToFeatures<TFeatureParams>[keyof TFeatureParams];
      }

      const children = React.createElement(Component, { ...props, ref: isValidRef(ref) ? ref : void 0 });

      return React.createElement(FeatureContext.Provider, { value: { ...features, ...sharedFeatures }, children });
    };

    return FeaturesSharedComponent;
  }

  return shareFeatureContext;
}

export default createFeatureContextSharer;
