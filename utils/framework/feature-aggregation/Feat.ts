import createFeatureHookApplier from './createFeatureHookApplier';
import createFeatureContext from './createFeatureContext';
import createFeatureContextApplier from './createFeatureContextApplier';
import createFeatureContextHook from './createFeatureContextHook';
import createFeatureContextInjectionHook from './createFeatureContextInjectionHook';
import createFeatureContextSharer from './createFeatureContextSharer';

export default {
  createHookApplier: createFeatureHookApplier,
  createContext: createFeatureContext,
  createContextApplier: createFeatureContextApplier,
  createContextHook: createFeatureContextHook,
  createContextInjectionHook: createFeatureContextInjectionHook,
  createContextSharer: createFeatureContextSharer,
};
