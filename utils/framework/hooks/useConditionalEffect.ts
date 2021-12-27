import React, { useEffect } from 'react';

const useConditionalEffect = (cond: boolean | (() => boolean)) => {
  const useConditionalEffect = (callback: React.EffectCallback, deps?: React.DependencyList) => {
    useEffect(() => {
      if (typeof cond === 'boolean' ? cond : cond()) {
        return callback();
      }
    }, [cond, ...(deps || [])]);
  };

  return useConditionalEffect;
};

export default useConditionalEffect;
