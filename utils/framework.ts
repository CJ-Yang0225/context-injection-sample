import React, { useContext } from 'react';

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

type UnknownFeatureParams = Record<string, readonly [FeatureSource, ...any[]]>;

export type BuiltInFeatureKey = keyof BuiltInFeatures;

export type BuiltInFeatures<TFeatureParams extends UnknownFeatureParams = {}> = {
  useProps: () => any;
  usePropsWithRef: () => any & { ref: () => React.Ref<any> };
  usePropsWithRefInHook: () => any & { ref: () => React.Ref<any> };
  useRef: () => React.Ref<any>;
  useRefInHook: () => React.Ref<any>;
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
  const appliedFeatures = {} as ConvertToFeatures<TFeatureParams>;
  const FeaturesContext = React.createContext(appliedFeatures);

  for (const featureKey in featureParams) {
    const [performFeature, ...dependencyKeys] = featureParams[featureKey] as TFeatureParams[typeof featureKey];

    appliedFeatures[featureKey] = dependencyKeys.length
      ? (applyFeaturesContext as any)(FeaturesContext, performFeature, dependencyKeys)
      : performFeature;
  }

  return FeaturesContext;
};

export const applyFeaturesContext = <TFeatureParams extends UnknownFeatureParams, TFeatureSource extends FeatureSource>(
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>,
  performFeature: TFeatureSource & { displayName?: string },
  dependencyKeys: FindPossibleDependencyKey<TFeatureParams, Parameters<TFeatureSource>>
) => {
  const performAppliedFeature = (props: any, ref: React.Ref<any>) => {
    const useProps = () => ({ ...(performAppliedFeature as any).defaultProps, ...props });
    const useRef = () => ref;
    const useRefInHook = useRef;
    const usePropsWithRefInHook = () => ({ ...useProps(), ref: useRef() });
    const useFeaturesContext = () => features;

    const features = {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ...useContext(FeaturesContext),
      useProps,
      useRef,
      useRefInHook,
      usePropsWithRefInHook,
      useFeaturesContext,
    };

    const dependencies = dependencyKeys.map((featureName) => features[featureName](props, ref));

    return performFeature(...dependencies);
  };

  extendComponent(performAppliedFeature, performFeature);
  delete (performAppliedFeature as any).defaultProps;

  /** @todo 改善 hook 判定或採用其他方式 */
  if (
    !/^use/.test(performFeature.displayName || performFeature.name) &&
    ((dependencyKeys as string[]).includes('useRef') || (dependencyKeys as string[]).includes('usePropsWithRef'))
  ) {
    const refForwardedFeature = React.forwardRef(performAppliedFeature);
    extendComponent(refForwardedFeature, performAppliedFeature);
    return refForwardedFeature;
  }

  return performAppliedFeature;
};

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
