// import { newSpecPage } from '@stencil/core/testing';
import { AmplifyScene } from './amplify-scene';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';

const mockExports = {
  aws_project_region: 'us-east-1',
  aws_cognito_identity_pool_id: 'us-east-1:dbc96cc0-bdb5-4948-9b87-6b940c807917',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_TufyikTmJ',
  aws_user_pools_web_client_id: '710g497prt1uacj8mq5bp8kmre',
  oauth: {},
  XR: {
    scenes: {
      scene1: {
        sceneConfig: {
          sceneId: 'b3711a0b52e24cb09dc73f1c70d74da4.scene',
          region: 'us-east-1',
          projectName: 'Drafts-assumed-role/Admin/jranz-Isengard',
          url:
            'https://sumerian.us-east-1.amazonaws.com/20180801/projects/Drafts-assumed-role%2FAdmin%2Fjranz-Isengard/release/authTokens?sceneId=b3711a0b52e24cb09dc73f1c70d74da4.scene',
        },
      },
    },
  },
};

Auth.configure(mockExports);
XR.configure(mockExports);

describe('amplify-sign-in spec:', () => {
  describe('Component logic ->', () => {
    let amplifyScene;

    beforeEach(() => {
      amplifyScene = new AmplifyScene();
    });

    it('`sceneName` should be undefined by default', () => {
      expect(amplifyScene.sceneName).toBeUndefined();
    });

    it('`loading` should be false by default', () => {
      expect(amplifyScene.loading).toBeFalsy();
    });
  });
  describe('Render logic ->', () => {
    // TODO: Add snapshot testing
    // it('should render', async () => {
    // 	const page = await newSpecPage({
    // 		components: [AmplifyScene],
    // 		html: `<amplify-scene sceneName={'scene1'} />`
    // 	});
    // 	expect(page.root).toMatchSnapshot();
    // });
  });
});
