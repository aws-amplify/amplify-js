import { AuthProvider } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('GenericProvider');

export default class GenericProvider extends BaseProvider implements AuthProvider {
    static NAME = 'Generic';

    constructor(options?) {
        super(options);
    }

    public getProviderName() {
        return GenericProvider.NAME;
    } 
}
