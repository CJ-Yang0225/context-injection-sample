import React from 'react';
import { extendClassNameProps } from './props';

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

export function combineRefProps<E extends Element, C extends React.VFC<any>, P = Parameters<C>[0]>(Component: C) {
  const RefPropCombinedComponent = React.forwardRef<E, P>((props, ref) => Component({ ...props, ref }));

  extendComponent(RefPropCombinedComponent, Component);
  RefPropCombinedComponent.displayName = `RefPropCombined(${RefPropCombinedComponent.displayName})`;

  return RefPropCombinedComponent;
}

export function modifyComponentStyle<C extends React.VFC<any>>(Component: C, className: string) {
  const StyleModifiedComponent: React.VFC<C extends React.ElementType<infer P> ? P : any> = (props) => {
    return Component(extendClassNameProps(className)(props));
  };

  extendComponent(StyleModifiedComponent, Component);
  StyleModifiedComponent.displayName = `StyleModified(${StyleModifiedComponent.displayName})`;

  return StyleModifiedComponent;
}

/** 針對 next.js 的 fast refresh 設計 */
export function applyFastRefresh<C extends React.VFC<any>>(Component: C) {
  const FastRefreshAppliedComponent: React.VFC<C extends React.ElementType<infer P> ? P : any> = (props) => {
    return React.createElement(Component, props);
  };

  extendComponent(FastRefreshAppliedComponent, Component);
  FastRefreshAppliedComponent.displayName = `FastRefreshApplied(${FastRefreshAppliedComponent.displayName})`;

  return FastRefreshAppliedComponent;
}
