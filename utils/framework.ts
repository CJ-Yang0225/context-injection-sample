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
} & { __isFeaturesContext: true };

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

export type GetFeatureParams<TFeaturesContext extends React.Context<any>> = TFeaturesContext extends React.Context<
  ConvertToFeatures<infer IFeatureParams>
>
  ? IFeatureParams
  : any;

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
    const useProps = () => props;
    const useRef = () => ref;
    const useContext = () => features;
    const usePropsWithRef = () => ({ ...props, ref });

    const features = {
      ...useReactContext(FeaturesContext),
      useProps,
      useRef,
      useContext,
      useRefInHook: useRef,
      usePropsWithRefInHook: usePropsWithRef,
    };

    return features;
  };

  function useAppliedFeature(props: any, ref: React.Ref<any>): ReturnType<TFeatureSource> {
    var features = arguments[2];

    if (!features || !features.__isFeaturesContext) {
      features = useFeatures(props, ref);
    }

    const useDependencySolver = (useDependency: any) => useDependency(props, ref, features);

    const dependencies = dependencyKeys
      .map((dependencyKey) => features![dependencyKey] as typeof useAppliedFeature)
      .map(useDependencySolver);

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
