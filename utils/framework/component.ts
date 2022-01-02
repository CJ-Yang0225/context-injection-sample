import React from 'react';
import { addClassNameProp as addClassName } from './props';

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

export function combineRefProp<
  E extends Element,
  C extends React.VFC<any>,
  P = C extends React.VFC<infer IP> ? IP : any
>(Component: C) {
  const RefPropCombinedComponent = React.forwardRef<E, P>((props, ref) => Component({ ...props, ref }, ref));

  extendComponent(RefPropCombinedComponent, Component);
  RefPropCombinedComponent.displayName = `CombineRefProps(${Component.name || Component.displayName})`;

  return RefPropCombinedComponent;
}

export function addClassNameProp<C extends React.ElementType<any>>(Component: C, className: string) {
  const ClassNamePropExtendedComponent: React.VFC<C extends React.ElementType<infer P> ? P : any> = (props) => {
    return React.createElement(Component, addClassName(className)(props));
  };

  extendComponent(ClassNamePropExtendedComponent, Component);

  const componentName = typeof Component === 'string' ? Component : Component.name || Component.displayName;
  ClassNamePropExtendedComponent.displayName = `ExtendClassNameProps(${componentName})`;

  return ClassNamePropExtendedComponent;
}
