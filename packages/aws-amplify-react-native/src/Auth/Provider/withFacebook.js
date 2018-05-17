
import React, { Component } from 'react';
import * as FBSDK from 'react-native-fbsdk';
import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withFacebook');


export default function withFacebook(Comp) {
    const {
        LoginManager,
        AccessToken
      } = FBSDK;
      
    return class extends Component { 
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        async signIn() {
            const that = this;
            LoginManager.logInWithReadPermissions(['public_profile']).then(
                function(result) {
                  if (result.isCancelled) {
                    alert('Login was cancelled');
                  } else {
                      logger.debug('sign in result chek FB' + JSON.stringify(result));
                    AccessToken.getCurrentAccessToken().then(
                      async (data) => {
                          const access_token = data.accessToken;
                          logger.debug('UMM FB TOKENN PROBABLY::' + data.accessToken.toString());
                          const response = await fetch(`https://graph.facebook.com/me?access_token=${data.accessToken}`);
                          logger.debug('UMM FB USER PROBABLY::' + JSON.stringify(response));
                        
                            const federatedResponse = {access_token, response};
                            that.federatedSignIn(federatedResponse);
                        });
                        logger.debug('Facebook success with result ' + JSON.stringify(result));
                        alert('Login was successful with result1: ', JSON.stringify(result));
                  }
                },
                function(error) {
                  alert('Login failed with error: ' + error);
                }
              );

        }

        federatedSignIn(response) {
            logger.debug(response);
            const { onStateChange } = this.props;
            const accessToken = response.access_token;
            const date = new Date();
            const expires_at =  date.getTime() + 3600;
             
            if (!accessToken) {
                return;
            }
            const user = {
                name: response.name
            }
            logger.debug('UserNAME ' + response.name);
            Auth.federatedSignIn('facebook', { token: accessToken, expires_at }, user)
                    .then(credentials => {
                        if (onStateChange) {
                            onStateChange('signedIn');
                        }
                    });
        }

        render() {
            return (
                <Comp {...this.props} facebookSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
        <SignInButton
            id="facebook_signin_btn"
            onPress={props.facebookSignIn}
            theme={props.theme || AmplifyTheme}
            title="Sign In with Facebook"
        />);
    

export const FacebookButton = withFacebook(Button);