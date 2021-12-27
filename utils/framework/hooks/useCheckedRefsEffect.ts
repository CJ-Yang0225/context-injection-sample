import React, { useCallback } from 'react';
import useConditionalEffect from './useConditionalEffect';

const useCheckedRefsEffect = (...refs: React.RefObject<any>[]) => {
  const useCheckedRefsEffect = (callback: (...currentObjects: any) => void, deps?: React.DependencyList) => {
    const isAllRefsChecked = useCallback(() => refs.every((ref) => ref.current), refs);

    useConditionalEffect(isAllRefsChecked)(() => {
      return callback(...refs.map((ref) => ref.current!));
    }, deps);
  };

  return useCheckedRefsEffect;
};

export default useCheckedRefsEffect;
