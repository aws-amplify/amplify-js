import React, { Component } from 'react';
import { Auth, Logger,JS } from 'aws-amplify';
import {AmplifyTheme} from './AmplifyTheme';
import GoogleSignInSingleton from './GoogleSignIn';
import { View, Text, TextInput, TouchableHighlight, Button } from 'react-native';

const logger = new Logger('withGoogle');

export const propStyle = (props, themeStyle) => {
    const { id, style } = props;
    const styl = Object.assign({}, style, themeStyle);
    if (!id) { return styl; }

    const selector = '#' + id;
    Object.assign(styl, styl[selector]);
    return styl;
}

export const SignInButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButton);
    const p = JS.objectLessAttributes(props, 'theme');

    return (
        <Button {...p} className="amplify-signin-button" style={style}>
            {props.children}
        </Button>
    )
}

export default function withGoogle(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        componentDidMount() {
            this.setupGoogleSignin();
        }

        async setupGoogleSignin() {
            const { google_ios_client_id, google_web_client_id } = this.props;
            try {
              
              await GoogleSignInSingleton.hasPlayServices({ autoResolve: true });
              await GoogleSignInSingleton.configure({
                webClientId:google_web_client_id,
                iosClientId:google_ios_client_id
              });
              
        
              const user = await GoogleSignInSingleton.currentUserAsync();
              logger.debug('Google current user in setup ' + JSON.stringify(user));
              
            }
            catch (err) {
                logger.debug('Google signin ERROR ' + JSON.stringify(err));
              console.log('Google signin errorss',err.code, err.message);
            }
          }

        async signIn() {
            GoogleSignInSingleton.signIn()
                .then((response) => {
                    logger.debug('GOOGLE SIGNIN DEETS ' + JSON.stringify(response));
                    const username = response.givenName ;
                    const email = response.email;
                    const accessToken = response.idToken;
                    const googleUser = {username,email, accessToken};
                    this.federatedSignIn(googleUser);
                })
                .catch((err) => {
                    console.log('WRONG SIGNIN', err);
            })
            .done();
          }

        federatedSignIn(googleUser) {
            const accessToken = googleUser.accessToken;
            const date = new Date();
            const expires_at = date.getTime()*1000 + 3600;
            const user = {
                email: googleUser.email,
                name: googleUser.name
            };
            const { onStateChange } = this.props;
            logger.debug('Federated sugn google with ' + accessToken);
            return Auth.federatedSignIn('google', { token: accessToken, expires_at }, user)
                .then(credentials => {
                    logger.debug('our credentials from auth are:',JSON.stringify(credentials));
                    if (onStateChange) {
                        onStateChange('signedIn');
                    }
                });
        }

        render() {
            return (
                <Comp {...this.props} googleSignIn={this.signIn} />
            )
        }
    }
}

const Buttony = (props) => (
    <SignInButton
        id="google_signin_btn"
        onPress={props.googleSignIn}
        theme={props.theme || AmplifyTheme}
        title="Sign In with Google"
    />
        
);

export const GoogleButton = withGoogle(Buttony);
