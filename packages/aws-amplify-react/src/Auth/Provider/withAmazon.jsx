import React, { Component } from 'react';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../../AmplifyTheme';
// import { SignInButton } from '../../AmplifyUI';
import { SignInButton, SignInButtonIcon, SignInButtonContent } from '../../Amplify-UI/Amplify-UI-Components-React';

const logger = new Logger('withAmazon');

export default function withAmazon(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.initAmazon = this.initAmazon.bind(this);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        signIn() {
            const amz = window.amazon;
            const options = { scope: 'profile' };
            amz.Login.authorize(options, (response) => {
                if (response.error) {
                    logger.debug('Failed to login with amazon: ' + response.error);
                    return;
                }
                
                this.federatedSignIn(response);
            });
        }

        federatedSignIn(response) {
            const { access_token, expires_in } = response;
            const { onStateChange } = this.props;
            const date = new Date();
            const expires_at = expires_in * 1000 + date.getTime();
            if (!access_token) {
                return;
            }

            const amz = window.amazon;
            amz.Login.retrieveProfile((userInfo) => {
                if (!userInfo.success) {
                    logger.debug('Get user Info failed');
                    return;
                }

                const user = {
                    name: userInfo.profile.Name
                }
                if (!Auth || 
                    typeof Auth.federatedSignIn !== 'function' || 
                    typeof Auth.currentAuthenticatedUser !== 'function') {
                    throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
                }

                Auth.federatedSignIn('amazon', { token: access_token, expires_at }, user)
                .then(credentials => {
                    return Auth.currentAuthenticatedUser();
                }).then(authUser => {
                    if (onStateChange) {
                        onStateChange('signedIn', authUser);
                    }
                });
            });
        }

        componentDidMount() {
            const { amazon_client_id } = this.props;
            if (amazon_client_id) this.createScript();
        }

        createScript() {
            const script = document.createElement('script');
            script.src = 'https://api-cdn.amazon.com/sdk/login1.js';
            script.async = true;
            script.onload = this.initAmazon;
            document.body.appendChild(script);
        }

        initAmazon() {
            logger.debug('init amazon');
            const { amazon_client_id } = this.props;
            const amz = window.amazon;
            amz.Login.setClientId(amazon_client_id);
        }

        render() {
            const amz = window.amazon;
            return (
                <Comp {...this.props} amz={amz} amazonSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <SignInButton
        id="amazon_signin_btn"
        onClick={props.amazonSignIn}
        theme={props.theme || AmplifyTheme}
    >
        <SignInButtonIcon id="amazon_signin_btn_icon">
            {/* <svg id='Layer_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><g id='g4641'><path id='rect2987' fill='#FE9900' d='M64,0h384c35.347,0,64,28.654,64,64v384c0,35.347-28.653,64-64,64H64 c-35.346,0-64-28.653-64-64V64C0,28.654,28.654,0,64,0z'/><path id='Amazon_2_' fill='#FFF' d='M292.578,183.824c-9.683,0.765-20.854,1.502-32.021,3.006 c-17.12,2.211-34.24,5.219-48.386,11.907c-27.544,11.208-46.163,35.053-46.163,70.114c0,44.018,28.298,66.354,64.026,66.354 c11.93,0,21.606-1.466,30.522-3.71c14.156-4.481,26.07-12.67,40.209-27.596c8.192,11.205,10.413,16.428,24.575,28.338 c3.725,1.502,7.448,1.502,10.413-0.742c8.932-7.458,24.561-20.873,32.773-28.33c3.71-3.012,2.955-7.463,0.739-11.204 c-8.198-10.435-16.381-19.401-16.381-39.506v-67.131c0-28.359,2.214-54.453-18.614-73.822 c-17.123-15.687-43.93-21.642-64.77-21.642c-2.99,0-5.949,0-8.947,0c-37.965,2.247-78.169,18.635-87.122,65.629 c-1.462,5.955,3.012,8.198,5.989,8.962l41.677,5.224c4.471-0.773,6.691-4.491,7.432-8.233c3.74-16.388,17.136-24.583,32.024-26.087 c0.754,0,1.504,0,2.998,0c8.905,0,18.586,3.743,23.813,11.168c5.932,8.965,5.21,20.904,5.21,31.339v5.961H292.578z M292.578,227.102c0,17.162,0.723,30.571-8.195,45.461c-5.208,10.437-14.141,17.154-23.827,19.4c-1.481,0-3.698,0.766-5.947,0.766 c-16.371,0-26.077-12.673-26.077-31.334c0-23.856,14.159-35.056,32.023-40.277c9.687-2.241,20.86-2.982,32.021-2.982v8.966H292.578 z M429.71,404.303c18.201-15.398,25.89-43.349,26.29-57.939v-2.44c0-3.255-0.803-5.661-1.6-6.88 c-3.646-4.445-30.369-8.523-53.402-1.627c-6.468,2.045-12.146,4.865-17.396,8.507c-4.051,2.854-3.238,6.464,0.802,6.08 c4.447-0.823,10.126-1.208,16.594-2.048c14.159-1.18,30.742-1.592,34.784,3.662c5.642,6.87-6.468,36.868-11.749,49.838 C422.44,405.521,426.063,407.152,429.71,404.303L429.71,404.303z M58.008,346.364c52.17,47.404,120.925,75.775,197.791,75.775 c47.725,0,102.727-13.381,145.199-38.899c5.676-3.27,11.316-6.912,16.565-10.952c7.286-5.25,0.817-13.38-6.463-10.147 c-3.229,1.215-6.873,2.857-10.103,4.066c-46.539,18.248-95.441,26.76-140.762,26.76c-72.008,0-141.56-19.87-197.786-52.684 C57.19,337.461,53.542,342.711,58.008,346.364L58.008,346.364z'/></g></svg> */}
            <svg viewBox='0 0 248 268' xmlns='http://www.w3.org/2000/svg'><g id='Artboard-Copy-2' fill='none' fillRule='evenodd'><path d='M139.056521,147.024612 C133.548808,156.744524 124.782731,162.726926 115.087401,162.726926 C101.790721,162.726926 93.9937779,152.612964 93.9937779,137.68681 C93.9937779,108.224571 120.447551,102.879017 145.533369,102.879017 L145.533369,110.365976 C145.533369,123.831358 145.876354,135.063787 139.056521,147.024612 M207.206992,162.579655 C209.400505,165.692256 209.887066,169.437725 207.063416,171.770186 C199.996315,177.653081 187.429476,188.590967 180.513926,194.716661 L180.46208,194.621133 C178.176838,196.663031 174.862638,196.810303 172.27828,195.445057 C160.780281,185.9162 158.686473,181.494078 152.405048,172.403055 C133.405233,191.751331 119.909143,197.534719 95.309886,197.534719 C66.1281801,197.534719 43.4791563,179.599451 43.4791563,143.669212 C43.4791563,115.616003 58.6782107,96.5105248 80.4019706,87.1727225 C99.2063636,78.9096034 125.464714,77.4528107 145.533369,75.1641337 L145.533369,70.694248 C145.533369,62.4749122 146.167493,52.7510201 141.297893,45.6541312 C137.110277,39.2856386 129.018206,36.6586354 121.859376,36.6586354 C108.658413,36.6586354 96.9171331,43.4171982 94.0416364,57.4199213 C93.4593582,60.532522 91.1701278,63.5933787 88.003492,63.7406501 L54.4387473,60.1424518 C51.6150972,59.5095829 48.4484614,57.2248862 49.2740201,52.8982915 C56.9712583,12.2553679 93.7983558,0 126.732964,0 C143.587124,0 165.606011,4.47386604 178.902691,17.2148315 C195.760839,32.917146 194.149604,53.8694866 194.149604,76.6726704 L194.149604,130.542157 C194.149604,146.734049 200.87372,153.830938 207.206992,162.579655 Z M233.826346,208.038962 C230.467669,203.683255 211.550709,205.9821 203.056405,206.998432 C200.470662,207.321077 200.076227,205.042397 202.406981,203.404973 C217.475208,192.664928 242.201125,195.766353 245.081698,199.363845 C247.966255,202.981502 244.336653,228.071183 230.172839,240.049379 C228.001452,241.888455 225.929671,240.904388 226.89783,238.468418 C230.077218,230.430525 237.204944,212.418868 233.826346,208.038962 Z M126.768855,264 C74.0234043,264 42.0764048,241.955028 17.7852554,217.541992 C12.9733903,212.705982 6.71799208,206.295994 3.31151296,200.690918 C1.90227474,198.372135 5.59096074,195.021875 8.0442063,196.84375 C38.2390146,219.267578 82.1011654,239.538304 125.529506,239.538304 C154.819967,239.538304 191.046475,227.469543 220.66851,214.867659 C225.146771,212.966167 225.146771,219.180222 224.511585,221.060516 C224.183264,222.03242 209.514625,236.221149 189.247207,247.047411 C170.304273,257.166172 146.397132,264 126.768855,264 Z'id='Fill-6' fill='#FFF' /></g></svg>
        </SignInButtonIcon>
        <SignInButtonContent>
            Sign In with Amazon
        </SignInButtonContent>
    </SignInButton>
)

export const AmazonButton = withAmazon(Button);
