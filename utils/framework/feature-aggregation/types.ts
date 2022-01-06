import React from 'react';

type PrevDependencyIndexes = [-1, 0, 1, 2, 3, 4, 5, 6];

export type UnknownFeatureParams = Record<string, readonly [FeatureSource, ...string[]]>;

export type BuiltInFeatures<TFeatureParams extends UnknownFeatureParams = {}> = {
  useProps: () => any;
  usePropsWithRef: () => any & { ref: () => React.Ref<any> };
  useRef: () => React.Ref<any>;
  useContext: () => ConvertToFeatures<TFeatureParams>;
};

type BuiltInDependencies<TFeatureParams extends UnknownFeatureParams = {}> = {
  [PFeatureKey in keyof BuiltInFeatures]: ReturnType<BuiltInFeatures<TFeatureParams>[PFeatureKey]>;
};

export type DependencyParamsType<TFeatureSource extends FeatureSource> = TFeatureSource extends {
  (...deps: any[]): any;
}
  ? Parameters<TFeatureSource>
  : TFeatureSource extends null
  ? []
  : [TFeatureSource extends React.ElementType<infer IProps> | React.ExoticComponent<infer IProps> ? IProps : any];

export type DependencyType<TFeatureSource extends FeatureSource> = TFeatureSource extends { (...deps: any[]): any }
  ? ReturnType<TFeatureSource>
  : TFeatureSource extends null
  ? never
  : React.ReactElement;

export type FeatureSource = { (...deps: any[]): any } | null | React.ElementType<any> | React.ExoticComponent<any>;

export type ConvertToFeatures<TFeatureParams extends UnknownFeatureParams> = {
  [PFeatureKey in keyof TFeatureParams]: (...args: any[]) => DependencyType<TFeatureParams[PFeatureKey][0]>;
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
            [PFeatureKey in keyof TFeatureParams]: DependencyType<
              TFeatureParams[PFeatureKey][0]
            > extends TDependencies[TDependencyKeyIndex]
              ? PFeatureKey
              : TDependencies[TDependencyKeyIndex] extends DependencyType<TFeatureParams[PFeatureKey][0]>
              ? PFeatureKey
              : never;
          }[Exclude<keyof TFeatureParams, TFeatureKey>]
        | {
            [PFeatureKey in keyof BuiltInFeatures]: TDependencies[TDependencyKeyIndex] extends BuiltInDependencies<TFeatureParams>[PFeatureKey]
              ? PFeatureKey
              : never;
          }[keyof BuiltInFeatures]
      )
    ];

export type RestrictFeatureParams<TFeatureParams extends UnknownFeatureParams = {}> = {
  readonly [PFeatureKey in keyof TFeatureParams]: ExtractDependencyKeys<
    TFeatureParams[PFeatureKey]
  > extends FindPossibleDependencyKeys<
    TFeatureParams,
    DependencyParamsType<TFeatureParams[PFeatureKey][0]>,
    PFeatureKey
  >
    ? TFeatureParams[PFeatureKey]
    : readonly [
        TFeatureParams[PFeatureKey][0],
        ...FindPossibleDependencyKeys<TFeatureParams, DependencyParamsType<TFeatureParams[PFeatureKey][0]>, PFeatureKey>
      ];
};
