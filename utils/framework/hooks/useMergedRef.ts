import React, { useCallback } from 'react';

function useMergedRef<T>(ref: React.Ref<T>) {
  const mergedRef = useCallback<React.RefCallback<T> & React.MutableRefObject<T | null>>(
    Object.assign(
      (instance: T) => {
        mergedRef.current = instance;

        if (typeof ref === 'function') {
          ref(instance);
        }

        if (typeof ref === 'object') {
          (ref as React.MutableRefObject<T>).current = instance;
        }
      },
      { current: null }
    ),
    [ref]
  );

  return mergedRef;
}

export default useMergedRef;
