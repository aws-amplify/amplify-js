import { AWS } from '../../Common';
/**
* Analytics instance options
*/
export interface AnalyticsOptions {
    appId: string;
    platform?: string;
    clientId?: string;
    region?: string;
    credentials?: AWS.Credentials & AWS.CognitoIdentityCredentials;
}
export interface EventAttributes {
    [key: string]: any;
}
export interface EventMetrics {
    [key: string]: number;
}
export declare enum SessionState {
    START = "START",
    STOP = "STOP",
}
