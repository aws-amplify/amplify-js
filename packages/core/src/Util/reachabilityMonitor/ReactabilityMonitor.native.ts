import ReachabilityNavigator from '../Reachability';
import { default as NetInfo } from '@react-native-community/netinfo';

export const ReachabilityMonitor = new ReachabilityNavigator().networkMonitor(
	NetInfo
);
