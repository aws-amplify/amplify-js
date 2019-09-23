import { AmplifyService } from '../../../providers/amplify.service';
import Amplify from 'aws-amplify';
import { S3AlbumComponentCore } from '../../../components/storage/s3-album-component/s3-album.component.core';

describe('S3AlbumComponentCore: ', () => {
	let component: S3AlbumComponentCore;
	let service: AmplifyService;

	beforeEach(() => {
		service = new AmplifyService(Amplify);
		component = new S3AlbumComponentCore(service);
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});
});
