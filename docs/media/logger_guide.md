---
---

# Logger

AWS Amplify writes console logs through Logger. You can use Logger in your apps for the same purpose.

## Installation

Import Logger:
```js
import { Logger } from 'aws-amplify';

```

## Working with the API

You can call logger for different console message modes:
```js

const logger = new Logger('foo');

logger.info('info bar');
logger.debug('debug bar');
logger.warn('warn bar');
logger.error('error bar');
```

When handling an error:
```js
try {
    ...
} catch(e) {
    logger.error('error happened', e);
}
```

## Setting Logging Levels

You can set a log level when you create your logger instance:

```js
const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); // this will not write the message
```

Global logger configuration will override your logger instance's configuration:

```js
Amplify.Logger.LOG_LEVEL = 'DEBUG';

const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); //  this will write the message since the global log level is 'DEBUG'
```

During web development, you can set global log level in browser console log:
```js
window.LOG_LEVEL = 'DEBUG';
```

Supported log levels:

* ERROR
* WARN
* INFO
* DEBUG
* VERBOSE
