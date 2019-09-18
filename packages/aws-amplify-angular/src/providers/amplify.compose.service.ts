import { AmplifyService } from './amplify.service';

export default modules => {
	return new AmplifyService(modules);
};
