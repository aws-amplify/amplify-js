# Logger

AWS Amplify writes logs through Logger.

## Usage

Create a logger
```js
import { Logger } from 'aws-amplify';

const logger = new Logger('foo');

logger.info('info bar');
logger.debug('debug bar');
logger.warn('warn bar');
logger.error('error bar');
```

When error
```js
try {
    ...
} catch(e) {
    logger.error('error happened', e);
}
```

## Log Level

Log level can be set on logger creation

```js
const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); // this will not write, unless ...
```

Global setting overrides logger instance setting

```js
Amplify.Logger.LOG_LEVEL = 'DEBUG';

const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); // this will write
```

During web development, you can set global log level in browser console log
```js
window.LOG_LEVEL = 'DEBUG';
```
