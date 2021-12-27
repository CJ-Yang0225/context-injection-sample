import React from 'react';

export function mergeRefs<T>(refA: React.Ref<T>, refB: React.Ref<T>) {
  return (instance: T) => {
    if (typeof refA === 'object' && refA) {
      (refA as React.MutableRefObject<T>).current = instance;
    }

    if (typeof refA === 'function') {
      refA(instance);
    }

    if (typeof refB === 'object' && refB) {
      (refB as React.MutableRefObject<T>).current = instance;
    }

    if (typeof refB === 'function') {
      refB(instance);
    }
  };
}

export function isValidRef(ref: any): ref is React.Ref<any> {
  return ref && (typeof ref === 'function' || 'current' in ref);
}
