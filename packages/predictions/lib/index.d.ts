import PredictionsClass from './Predictions';
import {
	AmazonAIConvertPredictionsProvider,
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
} from './Providers';
import { InterpretTextCategories } from './types';
declare const Predictions: PredictionsClass;
export default Predictions;
export {
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIConvertPredictionsProvider,
	AmazonAIPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
	InterpretTextCategories,
};
