export default class MobileAnalytics{
    constructor(object) {

    }

    putEvents(params, callback) {
        const random = Math.random();
        if (random < 0.5) callback({statusCode: 400, code: 'ThrottlingException'}, null);
        else callback(null, 'data');

    }
}