/* global window */
import Hub from '../Hub';
const handle = (callback, online) => {
    // NetInfo is not supported in browsers, hence we only pass online status
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => callback({ online }));
    } else {
      setTimeout(() => callback({ online }), 0);
    }
  };
  
  const detectNetwork = callback => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => handle(callback, true));
      window.addEventListener('offline', () => handle(callback, false));
      handle(callback, window.navigator.onLine);
    }
  };

  export default detectNetwork(online => {
    console.log('this is payload now!!', online);
    Hub.dispatch('network',{event: 'networkchange', data: 'online'},'Network');
  })

  