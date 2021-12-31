import React from 'react';
import createFeaturesContextApplier from './createFeaturesContextApplier';
import { BuiltInFeatures, ConvertToFeatures, RestrictFeatureParams, UnknownFeatureParams } from './type';

export interface FeaturesContextCreationOptions {
  componentKeyRegExp: RegExp;
}

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

function createFeaturesContext<TFeatureParams extends UnknownFeatureParams>(
  options: FeaturesContextCreationOptions
): (featureParams: RestrictFeatureParams<TFeatureParams>) => React.Context<ConvertToFeatures<TFeatureParams>>;
function createFeaturesContext<TFeatureParams extends UnknownFeatureParams>(
  featureParams: RestrictFeatureParams<TFeatureParams>
): React.Context<ConvertToFeatures<TFeatureParams>>;
function createFeaturesContext<TFeatureParams extends UnknownFeatureParams>(
  options: FeaturesContextCreationOptions | RestrictFeatureParams<TFeatureParams>
) {
  const createContext = (featureParams: RestrictFeatureParams<TFeatureParams>) => {
    const appliedFeatures = {} as ConvertToFeatures<TFeatureParams>;
    const FeaturesContext = React.createContext(appliedFeatures);
    const applyFeaturesContext = createFeaturesContextApplier(FeaturesContext);

    for (const featureKey in featureParams) {
      const [featureSource, ...dependencyKeys] = featureParams[featureKey] as UnknownFeatureParams[0];

      appliedFeatures[featureKey] = featureSource as typeof appliedFeatures[typeof featureKey];

      if (dependencyKeys.length > 0) {
        const allDependencyKeys = findAllDependencyKeys(featureParams as TFeatureParams, dependencyKeys);

        const isRefNeeded =
          ['useRefInHook', 'usePropsWithRefInHook'].every((key) => !dependencyKeys.includes(key)) &&
          ['useRef', 'usePropsWithRef', 'useRefInHook', 'usePropsWithRefInHook'].some((key) =>
            allDependencyKeys.includes(key)
          );

        appliedFeatures[featureKey] = applyFeaturesContext(
          featureSource,
          dependencyKeys as Parameters<typeof applyFeaturesContext>[1],
          { isRefNeeded, isComponent: (options as FeaturesContextCreationOptions).componentKeyRegExp.test(featureKey) }
        ) as typeof appliedFeatures[typeof featureKey];
      }
    }

    return FeaturesContext;
  };

  if ('componentKeyRegExp' in options) {
    return (featureParams: RestrictFeatureParams<TFeatureParams>) => createContext(featureParams);
  }

  const featureParams = options;
  options = { componentKeyRegExp: /^$/ };
  return createContext(featureParams);
}

export default createFeaturesContext;
