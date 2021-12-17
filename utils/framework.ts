import React, { useContext } from 'react';

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

export type BuiltInFeatureKey = keyof BuiltInFeatures;

export type BuiltInFeatures<
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [(...deps: any[]) => any, ...any[]];
  } = {}
> = {
  useProps: () => any;
  usePropsWithRef: () => { ref: () => React.Ref<any> };
  useRef: () => React.Ref<any>;
  useFeaturesContext: () => ConvertToFeatures<TFeatureParams>;
};

export type BuiltInDependencies<
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [(...deps: any[]) => any, ...any[]];
  } = {}
> = {
  [FeatureKey in BuiltInFeatureKey]: ReturnType<BuiltInFeatures<TFeatureParams>[FeatureKey]>;
};

export type MapDependencies<
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [(...deps: any[]) => any, ...any[]];
  },
  TDependencyKeys extends (keyof TFeatureParams | BuiltInFeatureKey)[],
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencyKeys['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...MapDependencies<TFeatureParams, TDependencyKeys, PrevDependencyIndexes[TDependencyKeyIndex]>,
      TDependencyKeys[TDependencyKeyIndex] extends keyof TFeatureParams
        ? ReturnType<TFeatureParams[TDependencyKeys[TDependencyKeyIndex]][0]>
        : TDependencyKeys[TDependencyKeyIndex] extends BuiltInFeatureKey
        ? BuiltInDependencies<TFeatureParams>[TDependencyKeys[TDependencyKeyIndex]]
        : any
    ];

type ExtractDependencyKeys<TFeatureParamsValue extends readonly [(...deps: any[]) => any, ...any[]]> =
  TFeatureParamsValue extends readonly [(...deps: any[]) => any, ...infer IDependencyKeys] ? IDependencyKeys : [];

export type FindPossibleDependencyKeys<
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [(...deps: any[]) => any, ...any[]];
  },
  TDependencies extends any[],
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencies['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...FindPossibleDependencyKeys<TFeatureParams, TDependencies, PrevDependencyIndexes[TDependencyKeyIndex]>,
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

export type GetFeatureParams<TFeatureContext extends React.Context<ConvertToFeatures<any>>> =
  TFeatureContext extends React.Context<ConvertToFeatures<infer IFeatureParams>> ? IFeatureParams : any;

export type ConvertToFeatures<
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [(...deps: any[]) => any, ...any[]];
  }
> = {
  [FeatureKey in keyof TFeatureParams]: (...args: any[]) => ReturnType<TFeatureParams[FeatureKey][0]>;
};

export const createFeaturesContext = <
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [
      (...deps: any[]) => any,
      ...(keyof TFeatureParams | BuiltInFeatureKey)[]
    ];
  }
>(featureParams: {
  readonly [FeatureKey in keyof TFeatureParams]: MapDependencies<
    TFeatureParams,
    ExtractDependencyKeys<TFeatureParams[FeatureKey]>
  > extends Parameters<TFeatureParams[FeatureKey][0]>
    ? TFeatureParams[FeatureKey]
    : readonly [
        TFeatureParams[FeatureKey][0],
        ...FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureParams[FeatureKey][0]>>
      ];
}) => {
  const appliedFeature = {} as ConvertToFeatures<TFeatureParams>;
  const FeaturesContext = React.createContext(appliedFeature);

  for (const featureKey in featureParams) {
    const [performFeature, ...dependencyKeys] = featureParams[featureKey];

    appliedFeature[featureKey] = dependencyKeys.length
      ? (applyFeaturesContext as any)(FeaturesContext, performFeature, dependencyKeys)
      : performFeature;
  }

  return FeaturesContext;
};

export const applyFeaturesContext = <
  TFeatureParams extends {
    readonly [FeatureKey in keyof TFeatureParams]: readonly [
      (...deps: any[]) => any,
      ...(keyof TFeatureParams | BuiltInFeatureKey)[]
    ];
  },
  TFeature extends (...deps: any) => any
>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  performFeature: TFeature & { displayName?: string },
  dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeature>>
) => {
  const appliedFeature = (...params: any[]) => {
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
    const refForwardedFeature = React.forwardRef(appliedFeature);
    refForwardedFeature.displayName = performFeature.displayName || performFeature.name;
    return refForwardedFeature;
  }

  appliedFeature.displayName = performFeature.displayName || performFeature.name;
  return appliedFeature;
};
