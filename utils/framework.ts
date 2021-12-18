import React, { useContext } from 'react';

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

type UnknownFeatureParams = Record<string, readonly [FeatureSource, ...any[]]>;

export type BuiltInFeatureKey = keyof BuiltInFeatures;

export type BuiltInFeatures<TFeatureParams extends UnknownFeatureParams = {}> = {
  useProps: () => any;
  usePropsWithRef: () => { ref: () => React.Ref<any> };
  useRef: () => React.Ref<any>;
  useFeaturesContext: () => ConvertToFeatures<TFeatureParams>;
};

export type BuiltInDependencies<TFeatureParams extends UnknownFeatureParams = {}> = {
  [FeatureKey in BuiltInFeatureKey]: ReturnType<BuiltInFeatures<TFeatureParams>[FeatureKey]>;
};

type FeatureSource = (...deps: any[]) => any;

type DependencyKey<TFeatureParams extends UnknownFeatureParams> = keyof TFeatureParams | BuiltInFeatureKey;

export type MapToDependencies<
  TFeatureParams extends UnknownFeatureParams,
  TDependencyKeys extends DependencyKey<TFeatureParams>[],
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencyKeys['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...MapToDependencies<TFeatureParams, TDependencyKeys, PrevDependencyIndexes[TDependencyKeyIndex]>,
      TDependencyKeys[TDependencyKeyIndex] extends keyof TFeatureParams
        ? ReturnType<TFeatureParams[TDependencyKeys[TDependencyKeyIndex]][0]>
        : TDependencyKeys[TDependencyKeyIndex] extends BuiltInFeatureKey
        ? BuiltInDependencies<TFeatureParams>[TDependencyKeys[TDependencyKeyIndex]]
        : any
    ];

export type ConvertToFeatures<TFeatureParams extends UnknownFeatureParams> = {
  [FeatureKey in keyof TFeatureParams]: (...args: any[]) => ReturnType<TFeatureParams[FeatureKey][0]>;
};

type ExtractDependencyKeys<TFeatureParamsValue extends readonly [FeatureSource, ...any[]]> =
  TFeatureParamsValue extends readonly [FeatureSource, ...infer IDependencyKeys] ? IDependencyKeys : [];

export type FindPossibleDependencyKey<
  TFeatureParams extends UnknownFeatureParams,
  TDependencies extends any[],
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencies['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...FindPossibleDependencyKey<TFeatureParams, TDependencies, PrevDependencyIndexes[TDependencyKeyIndex]>,
      (
        | {
            [FeatureKey in keyof TFeatureParams]: ReturnType<
              TFeatureParams[FeatureKey][0]
            > extends TDependencies[TDependencyKeyIndex]
              ? FeatureKey
              : never;
          }[keyof TFeatureParams]
        | {
            [FeatureKey in BuiltInFeatureKey]: TDependencies[TDependencyKeyIndex] extends BuiltInDependencies<TFeatureParams>[FeatureKey]
              ? FeatureKey
              : never;
          }[BuiltInFeatureKey]
      )
    ];

export type RestrictFeatureParams<TFeatureParams extends UnknownFeatureParams = {}> = {
  readonly [FeatureKey in keyof TFeatureParams]: ExtractDependencyKeys<
    TFeatureParams[FeatureKey]
  > extends DependencyKey<TFeatureParams>[]
    ? MapToDependencies<TFeatureParams, ExtractDependencyKeys<TFeatureParams[FeatureKey]>> extends Parameters<
        TFeatureParams[FeatureKey][0]
      >
      ? TFeatureParams[FeatureKey]
      : readonly [
          TFeatureParams[FeatureKey][0],
          ...FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureParams[FeatureKey][0]>>
        ]
    : readonly [
        TFeatureParams[FeatureKey][0],
        ...FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureParams[FeatureKey][0]>>
      ];
};

export const createFeaturesContext = <TFeatureParams extends UnknownFeatureParams>(
  featureParams: RestrictFeatureParams<TFeatureParams>
): React.Context<ConvertToFeatures<TFeatureParams>> => {
  const appliedFeature = {} as ConvertToFeatures<TFeatureParams>;
  const FeaturesContext = React.createContext(appliedFeature);

  for (const featureKey in featureParams) {
    const [performFeature, ...dependencyKeys] = featureParams[featureKey] as [
      FeatureSource,
      ...DependencyKey<TFeatureParams>[]
    ];

    appliedFeature[featureKey] = dependencyKeys.length
      ? (applyFeaturesContext as any)(FeaturesContext, performFeature, dependencyKeys)
      : performFeature;
  }

  return FeaturesContext;
};

export const applyFeaturesContext = <
  TFeatureParams extends UnknownFeatureParams,
  TFeature extends (...deps: any) => any
>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  performFeature: TFeature & { displayName?: string },
  dependencyKeys: FindPossibleDependencyKey<TFeatureParams, Parameters<TFeature>>
) => {
  const performAppliedFeature = (...params: any[]) => {
    const features = {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ...useContext(FeaturesContext),
      useProps: () => params[0],
      useRef: () => params[1],
      usePropsWithRef: () => ({ ...params[0], ref: params[1] }),
      useFeaturesContext: () => features,
    };

    const dependencies = dependencyKeys.map((featureName) => features[featureName](...params));

    return performFeature(...dependencies);
  };

  /** @todo 改善 hook 判定或採用其他方式 */
  if (
    !/^use/.test(performFeature.displayName || performFeature.name) &&
    ((dependencyKeys as string[]).includes('useRef') || (dependencyKeys as string[]).includes('usePropsWithRef'))
  ) {
    const refForwardedFeature = React.forwardRef(performAppliedFeature);
    refForwardedFeature.displayName = performFeature.displayName || performFeature.name;
    return refForwardedFeature;
  }

  performAppliedFeature.displayName = performFeature.displayName || performFeature.name;
  return performAppliedFeature;
};
