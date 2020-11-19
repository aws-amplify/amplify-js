import { Reachability } from '@aws-amplify/core';

// The export below isn't used; it's there to avoid LGTM complaints about unused imports.
// See https://github.com/microsoft/TypeScript/issues/5711 for why the import is needed.
import Observable from 'zen-observable';
export { Observable };

export const ReachabilityMonitor = new Reachability().networkMonitor();
