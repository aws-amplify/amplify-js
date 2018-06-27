---
---

# React

AWS Amplify provides React Components with `aws-amplify-react` npm package. Also, to help you start working with AWS Amplify, we provide a Starter App. 

See our [React Starter App in Github](https://github.com/awslabs/aws-mobile-react-sample).

## Installation and Configuration

Install following npm packages into your React app.

```bash
$ npm install aws-amplify
$ npm install aws-amplify-react
```

Then, you can import modoules from the package in your code:
```js
import { withAuthenticator } from 'aws-amplify-react';
```

### Using the Package with TypeScript

aws-amplify-react is written in JavaScript (unlike other aws-amplify packages which are written with TypeScript), and the package does not have type definitions. When using the package with TypeScript, you can avoid compiler errors by creating a type declaration file (e.g.:  aws-amplify-react.d.ts) containing:

```js
declare module 'aws-amplify-react';
```
 
### Setup

Follow setup and configuration steps in our [Quick Start Guide](https://aws.github.io/aws-amplify/media/quick_start?platform=react).

