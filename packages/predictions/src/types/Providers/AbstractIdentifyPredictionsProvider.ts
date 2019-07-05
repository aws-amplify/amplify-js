import { AbstractPredictionsProvider } from '.';
import {
    IdentifyEntityInput, IdentifyFacesInput, isIdentifyEntityInput,
    isIdentifyFacesInput, IdentifyEntityOutput, IdentifyFacesOutput
} from '../Predictions';
import { Logger } from '@aws-amplify/core';
const logger = new Logger('AbstractIdentifyPredictionsProvider');

export abstract class AbstractIdentifyPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return 'Identify';
    }

    identify(input: IdentifyEntityInput | IdentifyFacesInput): Promise<any> {
        if (isIdentifyEntityInput(input)) {
            logger.debug('identifyEntity');
            return this.identifyEntity(input);
        } else if (isIdentifyFacesInput(input)) {
            logger.debug('identifyFaces');
            return this.identifyFaces(input);
        } else {
            return this.orchestrateWithGraphQL(input);
        }
    }
    
    protected identifyEntity(input: IdentifyEntityInput): Promise<any> {
        throw new Error('identifyEntity is not implemented by this provider');
    }

    protected identifyFaces(input: IdentifyFacesInput): Promise<any> {
        throw new Error('identifyFaces is not implemented by this provider');
    }
}
