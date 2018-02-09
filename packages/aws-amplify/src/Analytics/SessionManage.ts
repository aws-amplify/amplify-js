import { Hub } from '../Common';
import Platform from '../Common/Platform';

// detect session stop
const date = new Date();
let preInteract = date.getTime();
const expireTime = 30*60*1000; // 30mins

const actions = ['mousemove', 'keydown', 'scroll'];

if (!Platform.isReactNative) {
    actions.map(action => {
        document.addEventListener(action, () => {
            const curInteract = date.getTime();
            if (preInteract + expireTime < curInteract) {
                Hub.dispatch('analytics', { eventType: 'session_start' }, 'Analytics');
            }
            preInteract = curInteract;
        });
    });
}
