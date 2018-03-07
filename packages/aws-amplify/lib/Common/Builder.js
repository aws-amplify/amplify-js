// import Analytics from '../Analytics';
// import Auth from '../Auth';
// import API from '../API';
// import Cache from '../Cache';
// import Storage from '../Storage';
// import { ConsoleLogger as Logger } from '../Common';
// const logger = new Logger('Builder');
// export default class Builder {
//     public addProvider(provider: any): Builder {
//         switch(provider.getCategory()) {
//             case 'Analytics':
//                 Analytics.setProvider(provider);
//                 break;
//             case 'Auth':
//                 break;
//             case 'API':
//                 break;
//             case 'Cache':
//                 break;
//             case 'Storage':
//                 break;
//             default:
//                 break;
//         }
//         return new Builder();
//     }
//     public async init(): Promise<any> {
//         try {
//             await Analytics.init();
//             // await Auth.init();
//             // await API.init();
//             // await Cache.init();
//             // await Storage.init();
//             return Promise.resolve();
//         } catch(e) {
//             logger.debug('init failed', e);
//             return Promise.resolve();
//         }
//     }
// }
//# sourceMappingURL=Builder.js.map