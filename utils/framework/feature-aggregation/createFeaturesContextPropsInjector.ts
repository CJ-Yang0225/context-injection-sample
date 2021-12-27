type PropsMap<PropKey> = PropKey | { [props: string]: PropsMap<PropKey> } | PropsMap<PropKey>[];

function mapFeatureProps<
  TFeatures extends Record<string, (...args: any) => any>,
  TPropsMap extends PropsMap<keyof TFeatures>
>(features: TFeatures, propsMap: TPropsMap): any {
  if (propsMap instanceof Array) {
    return propsMap.map((propsMap) => mapFeatureProps(features, propsMap));
  }

  if (typeof propsMap === 'object') {
    return Object.keys(propsMap).reduce(
      (props, propKey) => ((props[propKey] = mapFeatureProps(features, propsMap[propKey])), props),
      {} as any
    );
  }

  return features[propsMap as keyof typeof features];
}

function createFeaturesContextPropsInjector<TPropsMap extends Record<string, any>>(propsMap: TPropsMap) {
  const useFeaturePropsInjection = (props: any, features: any): Record<keyof TPropsMap, any> => {
    return Object.assign({ ...props }, mapFeatureProps(features, propsMap));
  };

  return useFeaturePropsInjection;
}

export default createFeaturesContextPropsInjector;
