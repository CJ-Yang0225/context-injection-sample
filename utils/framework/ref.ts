import React from 'react';

export function mergeRefs<T>(refA: React.Ref<T>, refB: React.Ref<T>) {
  return (el: T) => {
    if (typeof refA === 'object' && refA) {
      (refA as React.MutableRefObject<T>).current = el;
    }

    if (typeof refA === 'function') {
      refA(el);
    }

    if (typeof refB === 'object' && refB) {
      (refB as React.MutableRefObject<T>).current = el;
    }

    if (typeof refB === 'function') {
      refB(el);
    }
  };
}

export function isValidRef(ref: any): ref is React.Ref<any> {
  return ref && (typeof ref === 'function' || 'current' in ref);
}
