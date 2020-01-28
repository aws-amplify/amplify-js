import * as Observable from 'zen-observable';
var ReachabilityNavigator = /** @class */ (function() {
	function ReachabilityNavigator() {}
	ReachabilityNavigator.prototype.networkMonitor = function() {
		return new Observable(function(observer) {
			observer.next({ online: window.navigator.onLine });
			var notifyOnline = function() {
				return observer.next({ online: true });
			};
			var notifyOffline = function() {
				return observer.next({ online: false });
			};
			window.addEventListener('online', notifyOnline);
			window.addEventListener('offline', notifyOffline);
			return function() {
				window.removeEventListener('online', notifyOnline);
				window.removeEventListener('offline', notifyOffline);
			};
		});
	};
	return ReachabilityNavigator;
})();
export default ReachabilityNavigator;
//# sourceMappingURL=Reachability.js.map
