'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Observable = require('zen-observable');
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
exports.default = ReachabilityNavigator;
//# sourceMappingURL=Reachability.js.map
