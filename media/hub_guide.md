# Hub

AWS Amplify has a lightweight Pub-Sub system called Hub. It is used to share events between modules and components.

## Usage

Import
```js
import { Hub } from 'aws-amplify';
```

Dispatch an event
```js
Hub.dispatch('auth', { event: 'signIn', data: user }, 'Auth');
```

Listen to a channel
```js
import { Hub, Logger } from 'aws-amplify';

const logger = new Logger('MyClass');

class MyClass {
    constructor() {
        Hub.listen('auth', this, 'MyListener');
    }

    onHubCapsule(capsule) {
        const { name, payload, source } = capsule;
        logger.debug(name, payload, source);
    }
}
```

## Channel

AWS Amplify Auth publish in `auth` channel when 'signIn', 'signUp', and 'signOut' happens. You may create your listener to act upon event notifications.

```js
import { Hub, Logger } from 'aws-amplify';

const logger = new Logger('MyClass');

class MyClass {
    constructor() {
        Hub.listen('auth', this, 'MyListener');
    }

    onHubCapsule(capsule) {
        const { name, payload } = capsule;
        if (name === 'auth') { onAuthEvent(payload); }
    }

    onAuthEvent(payload) {
        const { event, data } = payload;
        switch (event) {
            case 'signIn':
                logger.debug('user signed in');
                break;
            case 'signUp':
                logger.debug('user signed up');
                break;
            case 'signOut':
                logger.debug('user signed out');
                break;
            case 'signIn_failure':
                logger.debug('user sign in failed');
                break;
        }
    }
}
```
