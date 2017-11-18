# Authenticator

## Integrate

### Use HOC

Use withAuthenticator HOC to prevent unauthenticated access to your page

First import
```
import { withAuthenticator } from 'aws-amplify-react';
```

Then just wrap the App
```
export default withAuthenticator(App);
```

Only authenticated user can access App. To provide a Sign Out button:
```
export default withAuthenticator(App, true); // include Greetings
```

### Standalone

Use the Authenticator as is.

First import
```
import { Authenticator } from 'aws-amplify-react';
```

Then just render it, handle the auth state change
```
handleStateChange = (authState, authData) => {
    if (authState === 'signedIn') { /* go to home page */ }
}

<Authenticator onStateChange={this.handleStateChange}/>
```

### App render with Auth UI

First import
```
import { Authenticator } from 'aws-amplify-react';
```

Then render App inside Authenticator
```
class App extends React.Component {
  render() {
    return (
        <div>My App</div>
    );
  }
}

const AuthApp = (props) => (
    <Authenticator>
        <App/>
    </Authenticator>
)

export default AuthApp;
```

To make sure App only renders when user is authenticated, check `authState` property
```
class App extends React.Component {
  render() {
    if (this.props.authState !== 'signedIn') { return null; }

    return (
        <div>My App</div>
    );
  }
}
```

Create your own Sign Out button
```
class App extends React.Component {
  render() {
    const { authState, Auth } = this.props;
    if (authState !== 'signedIn') { return null; }

    return (
        <div>
            <div>My App</div>
            <button onClick={() => Auth.signOut()}
        </div>
    );
  }
}
```
