import { Reachability } from '@aws-amplify/core';
import { default as NetInfo } from '@react-native-community/netinfo';
import Observable from 'zen-observable-ts';

export const ReachabilityMonitor = new Reachability().networkMonitor(
	NetInfo
) as Observable<{ online: boolean }>;
