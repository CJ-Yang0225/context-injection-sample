import React from 'react';
import createFeatureContextApplier from './createFeatureContextApplier';
import { BuiltInFeatures, ConvertToFeatures, RestrictFeatureParams, UnknownFeatureParams } from './types';

function findAllDependencyKeys<TFeatureParams extends UnknownFeatureParams>(
  featureParams: TFeatureParams,
  dependencyKeys: (keyof TFeatureParams | keyof BuiltInFeatures)[]
) {
  const allDependencyKeys = [...dependencyKeys];

  for (const dependencyKey of allDependencyKeys) {
    if ((dependencyKey as string) in featureParams) {
      const otherDependencyKeys = (featureParams[dependencyKey].slice(1) as typeof dependencyKeys).filter(
        (dependencyKey) => !allDependencyKeys.includes(dependencyKey)
      );

      allDependencyKeys.push(...otherDependencyKeys);
    }
  }

  return allDependencyKeys;
}

function createFeatureContext<TFeatureParams extends UnknownFeatureParams>(
  featureParams: RestrictFeatureParams<TFeatureParams>
) {
  const appliedFeatures = {} as ConvertToFeatures<TFeatureParams>;
  const FeatureContext = React.createContext(appliedFeatures);
  const applyFeatureContext = createFeatureContextApplier(FeatureContext);

  for (const featureKey in featureParams) {
    const [featureSource, ...dependencyKeys] = featureParams[featureKey] as UnknownFeatureParams[0];
    const isComponent = /[A-Z]/.test(featureKey[0]);

    appliedFeatures[featureKey] = featureSource as typeof appliedFeatures[typeof featureKey];

    if (featureSource && dependencyKeys.length > 0) {
      const allDependencyKeys = findAllDependencyKeys(featureParams as TFeatureParams, dependencyKeys);

      const isRefNeeded =
        isComponent && (allDependencyKeys.includes('useRef') || allDependencyKeys.includes('usePropsWithRef'));

      appliedFeatures[featureKey] = applyFeatureContext(
        featureSource,
        dependencyKeys as Parameters<typeof applyFeatureContext>[1],
        { isRefNeeded, isComponent }
      ) as typeof appliedFeatures[typeof featureKey];
    }
  }

  return FeatureContext;
}

export default createFeatureContext;
