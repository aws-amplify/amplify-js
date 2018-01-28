"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserAgent = 'aws-amplify/0.1.x js';
if (navigator && navigator.product) {
    switch (navigator.product) {
        case 'ReactNative':
            UserAgent = 'aws-amplify/0.1.x react-native';
            break;
        default:
            UserAgent = 'aws-amplify/0.1.x js';
            break;
    }
}
exports.default = UserAgent;
//# sourceMappingURL=index.js.map