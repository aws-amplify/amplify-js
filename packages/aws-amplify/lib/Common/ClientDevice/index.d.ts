export default class ClientDevice {
    static clientInfo(): {} | {
        'platform': string;
        'make': string;
        'model': string;
        'version': string;
        'appVersion': string;
        'language': string;
        'timezone': string;
    };
    static dimension(): {
        width: number;
        height: number;
    };
}
