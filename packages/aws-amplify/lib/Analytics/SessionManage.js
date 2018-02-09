"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../Common");
var Platform_1 = require("../Common/Platform");
// detect session stop
var date = new Date();
var preInteract = date.getTime();
var expireTime = 30 * 60 * 1000; // 30mins
var actions = ['mousemove', 'keydown', 'scroll'];
if (!Platform_1.default.isReactNative) {
    actions.map(function (action) {
        document.addEventListener(action, function () {
            var curInteract = date.getTime();
            if (preInteract + expireTime < curInteract) {
                Common_1.Hub.dispatch('analytics', { eventType: 'session_start' }, 'Analytics');
            }
            preInteract = curInteract;
        });
    });
}
//# sourceMappingURL=SessionManage.js.map