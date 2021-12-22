import React, { useContext as useReactContext } from 'react';

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

type UnknownFeatureParams = Record<string, readonly [FeatureSource, ...string[]]>;

export type BuiltInFeatureKey = keyof BuiltInFeatures;

export type BuiltInFeatures<TFeatureParams extends UnknownFeatureParams = {}> = {
  useProps: () => any;
  usePropsWithRef: () => any & { ref: () => React.Ref<any> };
  usePropsWithRefInHook: () => any & { ref: () => React.Ref<any> };
  useRef: () => React.Ref<any>;
  useRefInHook: () => React.Ref<any>;
  useContext: () => ConvertToFeatures<TFeatureParams>;
};

export type BuiltInDependencies<TFeatureParams extends UnknownFeatureParams = {}> = {
  [FeatureKey in BuiltInFeatureKey]: ReturnType<BuiltInFeatures<TFeatureParams>[FeatureKey]>;
};

type FeatureSource = (...deps: any[]) => any;

export type ConvertToFeatures<TFeatureParams extends UnknownFeatureParams> = {
  [FeatureKey in keyof TFeatureParams]: (...args: any[]) => ReturnType<TFeatureParams[FeatureKey][0]>;
} & { __isFeaturesContext: true; __featuresContextCache?: Partial<Record<keyof TFeatureParams, any>> };

type ExtractDependencyKeys<TFeatureParamsValue extends readonly [FeatureSource, ...any[]]> =
  TFeatureParamsValue extends readonly [FeatureSource, ...infer IDependencyKeys] ? IDependencyKeys : [];

export type FindPossibleDependencyKey<
  TFeatureParams extends UnknownFeatureParams,
  TDependencies extends any[],
  TFeatureKey extends any = never,
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencies['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...FindPossibleDependencyKey<
        TFeatureParams,
        TDependencies,
        TFeatureKey,
        PrevDependencyIndexes[TDependencyKeyIndex]
      >,
      (
        | {
            [FeatureKey in keyof TFeatureParams]: ReturnType<
              TFeatureParams[FeatureKey][0]
            > extends TDependencies[TDependencyKeyIndex]
              ? FeatureKey
              : never;
          }[Exclude<keyof TFeatureParams, TFeatureKey>]
        | {
            [FeatureKey in BuiltInFeatureKey]: TDependencies[TDependencyKeyIndex] extends BuiltInDependencies<TFeatureParams>[FeatureKey]
              ? FeatureKey
              : never;
          }[Exclude<
            BuiltInFeatureKey,
            TFeatureKey extends `use${string}` ? 'useRef' | 'usePropsWithRef' : 'useRefInHook' | 'usePropsWithRefInHook'
          >]
      )
    ];

export type RestrictFeatureParams<TFeatureParams extends UnknownFeatureParams = {}> = {
  readonly [FeatureKey in keyof TFeatureParams]: ExtractDependencyKeys<
    TFeatureParams[FeatureKey]
  > extends FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureParams[FeatureKey][0]>, FeatureKey>
    ? TFeatureParams[FeatureKey]
    : readonly [
        TFeatureParams[FeatureKey][0],
        ...FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureParams[FeatureKey][0]>, FeatureKey>
      ];
};

export function createFeaturesContext<TFeatureParams extends UnknownFeatureParams>(
  featureParams: RestrictFeatureParams<TFeatureParams>
): React.Context<ConvertToFeatures<TFeatureParams>> {
  const appliedFeatures = { __isFeaturesContext: true } as ConvertToFeatures<TFeatureParams>;
  const FeaturesContext = React.createContext(appliedFeatures);

  for (const featureKey in featureParams) {
    const [featureSource, ...dependencyKeys] = featureParams[featureKey] as TFeatureParams[typeof featureKey];

    appliedFeatures[featureKey] = featureSource as any;

    if (dependencyKeys.length > 0) {
      const allDependencyKeys = [...dependencyKeys] as (keyof TFeatureParams)[];

      for (const dependencyKey of allDependencyKeys) {
        if (dependencyKey in featureParams) {
          const [, ...dependencyKeysOfDependency] = featureParams[dependencyKey];

          allDependencyKeys.push(
            ...(dependencyKeysOfDependency as (keyof TFeatureParams)[]).filter((dependencyKey) =>
              allDependencyKeys.every((key) => key !== dependencyKey)
            )
          );
        }
      }

      const isRefNeeded =
        ['useRef', 'usePropsWithRef', 'useRefInHook', 'usePropsWithRefInHook'].some((key) =>
          allDependencyKeys.includes(key)
        ) && ['useRefInHook', 'usePropsWithRefInHook'].every((key) => !dependencyKeys.includes(key));

      appliedFeatures[featureKey] = (applyFeaturesContext as any)(
        FeaturesContext,
        featureSource,
        dependencyKeys,
        isRefNeeded
      );
    }
  }

  return FeaturesContext;
}

export function applyFeaturesContext<TFeatureParams extends UnknownFeatureParams, TFeatureSource extends FeatureSource>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  featureSource: TFeatureSource & { displayName?: string },
  dependencyKeys: FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureSource>>,
  isRefNeeded: boolean = false
) {
  const useFeatures = (props: any, ref: React.Ref<any>): ConvertToFeatures<TFeatureParams> => {
    const propsWithRef = { ...props, ref };

    const useProps = () => props;
    const useRef = () => ref;
    const useContext = () => features;
    const usePropsWithRef = () => propsWithRef;

    const features = {
      ...useReactContext(FeaturesContext),
      __featuresContextCache: {},
      useProps,
      useRef,
      useContext,
      useRefInHook: useRef,
      usePropsWithRefInHook: usePropsWithRef,
    };

    return features;
  };

  function useAppliedFeature(props: any, ref: React.Ref<any>): ReturnType<TFeatureSource> {
    var features = arguments[2] as ConvertToFeatures<TFeatureParams>;

    if (!features || !features.__isFeaturesContext) {
      features = useFeatures(props, ref);
    }

    const useDependencySolver = (dependencyKey: keyof TFeatureParams) => {
      if (features.__featuresContextCache && dependencyKey in features.__featuresContextCache) {
        return features.__featuresContextCache![dependencyKey];
      }

      const useDependency = features![dependencyKey];
      const dependency = useDependency(props, ref, features);

      if (features.__featuresContextCache) {
        features.__featuresContextCache[dependencyKey] = dependencyKeys;
      }

      return dependency;
    };

    const dependencies = dependencyKeys.map(useDependencySolver);

    return featureSource(...dependencies);
  }

  extendComponent(useAppliedFeature as React.ElementType, featureSource);

  if (isRefNeeded) {
    const FeatureAppliedComponent = React.forwardRef(
      useAppliedFeature as React.ForwardRefRenderFunction<any, Parameters<typeof useAppliedFeature>[1]>
    );
    extendComponent(FeatureAppliedComponent, useAppliedFeature as React.ElementType);
    return FeatureAppliedComponent;
  }

  return useAppliedFeature;
}

export function createFeaturesContextApplier<TFeatureParams extends UnknownFeatureParams>(
  FeatureContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  return <TFeatureSource extends (...args: any[]) => any>(
    featureSource: TFeatureSource,
    dependencyKeys: FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureSource>>,
    isRefNeeded: boolean = false
  ) => applyFeaturesContext(FeatureContext, featureSource, dependencyKeys, isRefNeeded);
}

/**
 * 補上額外的靜態屬性，其中將 $$typeof 與 render 排除，避免 react 判斷為其他元件 (如: forward ref) 導致失效。
 * @param ExtendedComponent
 * @param Component
 */
export function extendComponent(ExtendedComponent: React.ElementType, Component: React.ElementType) {
  if (typeof Component !== 'string') {
    const { $$typeof, render, ...staticMembers } = Component as any;
    Object.assign(ExtendedComponent, staticMembers);
    (ExtendedComponent as React.ComponentType).displayName = Component.displayName || Component.name;
  }
}

export const usePropsInjection =
  <TPropsMap extends Record<string, string>>(propsMap: TPropsMap) =>
  (props: any, features: any): { [propName in keyof TPropsMap]: any } => ({
    ...props,
    ...Object.fromEntries(Object.entries(propsMap).map(([targetKey, sourceKey]) => [targetKey, features[sourceKey]])),
  });
