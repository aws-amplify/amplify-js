---
---

# React

AWS Amplify helps developers to create high-quality React apps quickly by handling the heavy lifting of configuring and integrating cloud services behind the scenes. It also provides a powerful high-level API and ready-to-use security best practices.

For React developers, AWS Amplify provides following main benefits:
- Easy integration with cloud operations with declarative API
- CLI support for bootstrapping your app backend quickly
- Local configuration and deployment of your app’s backend logic
- Deployment of static assets for hosting and streaming
- React UI components for common operations such as Authorization and Storage
- Monitoring app usage and engaging users with campaign analytics

## Installation and Configuration

AWS Amplify provides React Components with `aws-amplify-react` npm package. Also, to help you start working with AWS Amplify, we provide a Starter App. See our [React Starter App in Github](https://github.com/awslabs/aws-mobile-react-sample).

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

Follow setup and configuration steps in our [Get Started Guide](https://aws-amplify.github.io/amplify-js/media/quick_start?platform=react).

