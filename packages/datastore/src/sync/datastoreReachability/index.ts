import { Reachability } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';

export const ReachabilityMonitor =
	new Reachability().networkMonitor() as Observable<{ online: boolean }>;
