import React from 'react';
import { combineRefProps, extendComponent } from '../component';
import { ConvertToFeatures, FeatureSource, FindPossibleDependencyKeys, UnknownFeatureParams } from './type';
import createFeaturesContextHook from './createFeaturesContextHook';

export interface FeaturesContextApplyOptions {
  isRefNeeded?: boolean;
  isComponent?: boolean;
}

function useDependencySolver<TFeatureParams extends UnknownFeatureParams>(
  features: ConvertToFeatures<TFeatureParams>,
  props: any,
  ref?: React.Ref<any>
) {
  const useDependencySolver = (dependencyKey: keyof TFeatureParams) => {
    if (features.__loadedDependencies && dependencyKey in features.__loadedDependencies) {
      return features.__loadedDependencies![dependencyKey];
    }

    const useDependency = features[dependencyKey];
    const dependency = useDependency(props, ref, features);

    if (features.__loadedDependencies) {
      features.__loadedDependencies[dependencyKey] = dependency;
    }

    return dependency;
  };

  return useDependencySolver;
}

function createFeaturesContextApplier<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext:
    | React.Context<ConvertToFeatures<TFeatureParams>>
    | (() => React.Context<ConvertToFeatures<TFeatureParams>>)
) {
  const useFeaturesContext = createFeaturesContextHook(FeaturesContext);

  function applyFeaturesContext<TFeatureSource extends FeatureSource>(
    useFeature: TFeatureSource,
    dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureSource>>,
    options: FeaturesContextApplyOptions = {}
  ) {
    if (options.isComponent) {
      let FeatureComponent: any = useFeature;

      if (options.isRefNeeded) {
        FeatureComponent = combineRefProps(useFeature);
        extendComponent(FeatureComponent, useFeature);
      }

      useFeature = ((props: Parameters<typeof useFeature>[0]) =>
        React.createElement(FeatureComponent, props)) as unknown as typeof useFeature;

      Object.assign(useFeature, {
        displayName: 'FastRefreshSolved(' + (FeatureComponent.displayName || FeatureComponent.name) + ')',
      });
    }

    function useAppliedFeature(
      props: any,
      ref?: React.Ref<any>,
      features?: ConvertToFeatures<TFeatureParams>
    ): ReturnType<TFeatureSource> {
      features = features?.__isFeaturesRoot ? features : useFeaturesContext(props, ref);
      const dependencies = dependencyKeys.map(useDependencySolver(features, props, ref));
      return useFeature(...dependencies);
    }

    extendComponent(useAppliedFeature as React.ElementType, useFeature);

    if (options.isRefNeeded) {
      return combineRefProps(useAppliedFeature);
    }

    return useAppliedFeature;
  }

  return applyFeaturesContext;
}

export default createFeaturesContextApplier;
