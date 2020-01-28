import * as Observable from 'zen-observable';
declare type NetworkStatus = {
	online: boolean;
};
export default class ReachabilityNavigator implements Reachability {
	networkMonitor(): Observable<NetworkStatus>;
}
interface Reachability {
	networkMonitor(): Observable<NetworkStatus>;
}
export {};
