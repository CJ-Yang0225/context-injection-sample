import React, { useContext as useReactContext } from 'react';

/** 補上額外的靜態屬性(不含 `$$typeof`) */
export function extendComponent(ExtendedComponent: React.ElementType, Component: React.ElementType) {
  if (typeof ExtendedComponent !== 'string' && typeof Component !== 'string') {
    // 此處說明包含 $$typeof 後會發生的情況：
    // 若 Component 為 ForwardRefExoticComponent，而 ExtendedComponent 完全複製 Component 中的屬性：
    // react 處理 render 時，檢查了 ExtendedComponent 中的 $$typeof 屬性 (來自 Component)，
    // 將 ExtendedComponent 視為 ForwardRefExoticComponent，因此使用了 ExtendedComponent 中的 render 方法 (來自 Component)，
    // 導致 ExtendedComponent 執行過程與 Component (ForwardRefExoticComponent) 無異，使 ExtendedComponent 失去作用。

    const { $$typeof, ...staticMembers } = Component as React.ForwardRefExoticComponent<any>;
    Object.assign(staticMembers, ExtendedComponent);
    staticMembers.displayName = Component.displayName || Component.name;
    Object.assign(ExtendedComponent, staticMembers);
  }
}

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

export type UnknownFeatureParams = Record<string, readonly [FeatureSource, ...string[]]>;

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
  [PFeatureKey in BuiltInFeatureKey]: ReturnType<BuiltInFeatures<TFeatureParams>[PFeatureKey]>;
};

type FeatureSource = (...deps: any[]) => any;

export type ConvertToFeatures<TFeatureParams extends UnknownFeatureParams> = {
  [PFeatureKey in keyof TFeatureParams]: (...args: any[]) => ReturnType<TFeatureParams[PFeatureKey][0]>;
} & { __isFeaturesRoot: true; __loadedDependencies: Partial<Record<keyof TFeatureParams, any>> };

type ExtractDependencyKeys<TFeatureParamsValue extends readonly [FeatureSource, ...any[]]> =
  TFeatureParamsValue extends readonly [FeatureSource, ...infer UDependencyKeys] ? UDependencyKeys : [];

export type FindPossibleDependencyKeys<
  TFeatureParams extends UnknownFeatureParams,
  TDependencies extends any[],
  TFeatureKey extends any = never,
  TDependencyKeyIndex extends number = PrevDependencyIndexes[TDependencies['length']]
> = TDependencyKeyIndex extends -1
  ? []
  : [
      ...FindPossibleDependencyKeys<
        TFeatureParams,
        TDependencies,
        TFeatureKey,
        PrevDependencyIndexes[TDependencyKeyIndex]
      >,
      (
        | {
            [PFeatureKey in keyof TFeatureParams]: ReturnType<
              TFeatureParams[PFeatureKey][0]
            > extends TDependencies[TDependencyKeyIndex]
              ? PFeatureKey
              : never;
          }[Exclude<keyof TFeatureParams, TFeatureKey>]
        | {
            [PFeatureKey in BuiltInFeatureKey]: TDependencies[TDependencyKeyIndex] extends BuiltInDependencies<TFeatureParams>[PFeatureKey]
              ? PFeatureKey
              : never;
          }[Exclude<
            BuiltInFeatureKey,
            TFeatureKey extends `use${string}` ? 'useRef' | 'usePropsWithRef' : 'useRefInHook' | 'usePropsWithRefInHook'
          >]
      )
    ];

export type RestrictFeatureParams<TFeatureParams extends UnknownFeatureParams = {}> = {
  readonly [PFeatureKey in keyof TFeatureParams]: ExtractDependencyKeys<
    TFeatureParams[PFeatureKey]
  > extends FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureParams[PFeatureKey][0]>, PFeatureKey>
    ? TFeatureParams[PFeatureKey]
    : readonly [
        TFeatureParams[PFeatureKey][0],
        ...FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureParams[PFeatureKey][0]>, PFeatureKey>
      ];
};

function findAllDependencyKeys<TFeatureParams extends UnknownFeatureParams>(
  featureParams: TFeatureParams,
  dependencyKeys: (keyof TFeatureParams | BuiltInFeatureKey)[]
) {
  const allDependencyKeys = [...dependencyKeys];

  for (const dependencyKey of allDependencyKeys) {
    allDependencyKeys.push(
      ...(featureParams[dependencyKey].slice(1) as string[]).filter(
        (dependencyKey) => dependencyKey in featureParams && allDependencyKeys.every((key) => key !== dependencyKey)
      )
    );
  }

  return allDependencyKeys;
}

export function createFeaturesContext<TFeatureParams extends UnknownFeatureParams>(
  featureParams: RestrictFeatureParams<TFeatureParams>
) {
  const appliedFeatures = {} as ConvertToFeatures<TFeatureParams>;
  const FeaturesContext = React.createContext(appliedFeatures);

  for (const featureKey in featureParams) {
    const [featureSource, ...dependencyKeys] = featureParams[featureKey] as UnknownFeatureParams[0];

    appliedFeatures[featureKey] = featureSource as any;

    if (dependencyKeys.length > 0) {
      const allDependencyKeys = findAllDependencyKeys(featureParams as TFeatureParams, dependencyKeys);

      const isRefNeeded =
        ['useRefInHook', 'usePropsWithRefInHook'].every((key) => !dependencyKeys.includes(key)) &&
        ['useRef', 'usePropsWithRef', 'useRefInHook', 'usePropsWithRefInHook'].some((key) =>
          allDependencyKeys.includes(key)
        );

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
  dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureSource>>,
  isRefNeeded: boolean = false
) {
  function useAppliedFeature(
    props: any,
    ref?: React.Ref<any>,
    features?: ConvertToFeatures<TFeatureParams>
  ): ReturnType<TFeatureSource> {
    if (!features || !features.__isFeaturesRoot) {
      features = useFeaturesRoot(FeaturesContext, props, ref);
    }

    const dependencies = dependencyKeys.map(useDependencySolver(features, props, ref));
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

export function useFeaturesRoot<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  props: any,
  ref?: React.Ref<any>
) {
  const propsWithRef = { ...props, ref };

  const useProps = () => props;
  const useRef = () => ref;
  const useContext = () => features;
  const usePropsWithRef = () => propsWithRef;

  const features: ConvertToFeatures<TFeatureParams> = {
    ...useReactContext(FeaturesContext),
    __isFeaturesRoot: true,
    __featuresContextCache: {},
    useProps,
    useRef,
    useContext,
    useRefInHook: useRef,
    usePropsWithRefInHook: usePropsWithRef,
  };

  return features;
}

export function useDependencySolver<TFeatureParams extends UnknownFeatureParams>(
  features: ConvertToFeatures<TFeatureParams>,
  props: any,
  ref?: React.Ref<any>
) {
  const useDependencySolver = (dependencyKey: keyof TFeatureParams) => {
    if (features.__loadedDependencies && dependencyKey in features.__loadedDependencies) {
      return features.__loadedDependencies![dependencyKey];
    }

    const useDependency = features![dependencyKey];
    const dependency = useDependency(props, ref, features);

    if (features.__loadedDependencies) {
      features.__loadedDependencies[dependencyKey] = dependency;
    }

    return dependency;
  };

  return useDependencySolver;
}

export function createFeaturesContextApplier<TFeatureParams extends UnknownFeatureParams>(
  FeatureContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  return (applyFeaturesContext as any).bind(null, FeatureContext) as <TFeatureSource extends (...args: any[]) => any>(
    featureSource: TFeatureSource,
    dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureSource>>,
    isRefNeeded?: boolean
  ) => ReturnType<typeof applyFeaturesContext>;
}

export function useFeaturesPropsInjection<TPropsMap extends Record<string, string>>(propsMap: TPropsMap) {
  const usePropsInjection = (props: any, features: any): Record<keyof TPropsMap, any> => {
    props = { ...props };

    for (const propKey in propsMap) {
      const featureKey = propsMap[propKey];
      const feature = features[featureKey];
      props[propKey] = feature;
    }

    return props;
  };

  return usePropsInjection;
}

export function shareFeatures<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  Component: any,
  dependencyKeys: (keyof TFeatureParams)[]
) {
  const FeaturesSharedComponent = (props: any, ref?: React.Ref<any>) => {
    const features = useFeaturesRoot(FeaturesContext, props, ref);
    const sharedFeatures = {} as ConvertToFeatures<TFeatureParams>;

    for (const dependencyKey of dependencyKeys) {
      const useDependency = features[dependencyKey];
      const dependency = useDependency(props, ref, features);
      features.__loadedDependencies[dependencyKey] = dependency;
      const useSharedDependency = (() => dependency) as ConvertToFeatures<TFeatureParams>[keyof TFeatureParams];
      sharedFeatures[dependencyKey] = useSharedDependency;
    }

    const children = React.createElement(Component, { ...props, ref: (ref as any)?.current ? ref : void 0 });

    return React.createElement(FeaturesContext.Provider, { value: { ...features, ...sharedFeatures }, children });
  };

  return FeaturesSharedComponent;
}
