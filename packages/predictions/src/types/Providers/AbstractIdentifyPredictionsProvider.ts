import { AbstractPredictionsProvider } from '.';
import {
    IdentifyEntityInput, IdentifyFacesInput, isIdentifyEntityInput,
    isIdentifyFacesInput, IdentifyTextInput, isIdentifyTextInput,
    IdentifyTextOutput, IdentifyEntityOutput, IdentifyFacesOutput
} from '../Predictions';
import { Logger } from '@aws-amplify/core';
const logger = new Logger('AbstractIdentifyPredictionsProvider');

export abstract class AbstractIdentifyPredictionsProvider extends AbstractPredictionsProvider {

    getCategory(): string {
        return 'Identify';
    }

    identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
    identify(input: IdentifyEntityInput): Promise<IdentifyEntityOutput>;
    identify(input: IdentifyFacesInput): Promise<IdentifyFacesOutput>;
    identify(input: IdentifyTextInput | IdentifyEntityInput | IdentifyFacesInput)
        : Promise<IdentifyTextOutput | IdentifyEntityOutput | IdentifyFacesOutput> {
        if (isIdentifyTextInput(input)) {
            logger.debug('identifyText');
            return this.identifyText(input);
        } else if (isIdentifyEntityInput(input)) {
            logger.debug('identifyEntity');
            return this.identifyEntity(input);
        } else if (isIdentifyFacesInput(input)) {
            logger.debug('identifyFaces');
            return this.identifyFaces(input);
        }
        // else {
        //     return this.orchestrateWithGraphQL(input);
        // }
    }

    protected identifyText(input: IdentifyTextInput): Promise<IdentifyTextOutput> {
        throw new Error('identifyText is not implemented by this provider.');
    }

    protected identifyEntity(input: IdentifyEntityInput): Promise<IdentifyEntityOutput> {
        throw new Error('identifyEntity is not implemented by this provider');
    }

    protected identifyFaces(input: IdentifyFacesInput): Promise<IdentifyFacesOutput> {
        throw new Error('identifyFaces is not implemented by this provider');
    }
}
