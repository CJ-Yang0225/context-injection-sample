import React from 'react';
import { combineRefProp, extendComponent } from '../component';
import {
  ConvertToFeatures,
  DependencyParamsType,
  DependencyType,
  FeatureSource,
  FindPossibleDependencyKeys,
  UnknownFeatureParams,
} from './types';
import createFeatureContextHook from './createFeatureContextHook';

export interface FeatureContextApplyOptions {
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

function createFeatureContextApplier<TFeatureParams extends UnknownFeatureParams>(
  FeatureContext:
    | React.Context<ConvertToFeatures<TFeatureParams>>
    | (() => React.Context<ConvertToFeatures<TFeatureParams>>)
) {
  const useFeatureContext = createFeatureContextHook(FeatureContext);

  function applyFeatureContext<TFeatureSource extends FeatureSource>(
    useFeature: TFeatureSource,
    dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, DependencyParamsType<TFeatureSource>>,
    options: FeatureContextApplyOptions = {}
  ) {
    if (options.isComponent || typeof useFeature !== 'function') {
      const FeatureComponent: React.ElementType<any> = useFeature;
      const renderFeatureComponent = (props: any) => React.createElement(FeatureComponent, props);
      extendComponent(renderFeatureComponent, FeatureComponent);
      useFeature = renderFeatureComponent as TFeatureSource;
    }

    function useAppliedFeature(
      props: any,
      ref?: React.Ref<any>,
      features?: ConvertToFeatures<TFeatureParams>
    ): DependencyType<TFeatureSource> {
      features = features?.__isFeaturesRoot ? features : useFeatureContext(props, ref);
      const dependencies = dependencyKeys.map(useDependencySolver(features, props, ref));
      return (useFeature as (...args: any[]) => any)(...dependencies);
    }

    extendComponent(useAppliedFeature as React.ElementType, useFeature);

    if (options.isRefNeeded) {
      return Object.assign(combineRefProp(useAppliedFeature), {
        displayName: 'ApplyFeatureContext(' + ((useFeature as any).displayName || (useFeature as any).name) + ')',
      });
    }

    Object.assign(useAppliedFeature, {
      displayName: 'ApplyFeatureContext(' + ((useFeature as any).displayName || (useFeature as any).name) + ')',
    });

    return useAppliedFeature;
  }

  return applyFeatureContext;
}

export default createFeatureContextApplier;
