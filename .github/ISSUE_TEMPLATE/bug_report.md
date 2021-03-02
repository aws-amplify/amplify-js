---
name: Bug report
about: Create a report to help us improve
title: ''
labels: to-be-reproduced
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Code Snippet**
Please provide a code snippet or a link to sample code of the issue you are experiencing to help us reproduce the issue. (Be sure to remove any sensitive data)

**Screenshots**
If applicable, add screenshots to help explain your problem.

**What is Configured?**
If applicable, please provide what is configured for Amplify CLI:
* Which steps did you follow via Amplify CLI when configuring your resources.
* Which resources do you have configured?
  * If applicable, please provide your `aws-exports` file:
   ```
   const awsmobile = {
       "aws_project_region": "us-east-1",
       "aws_cognito_identity_pool_id": "us-east-1:xxx-xxxx-xxxx-xxxx-xxxxxxxx",
       "aws_cognito_region": "us-east-1",
       "aws_user_pools_id": "us-east-1_xxx",
       "aws_user_pools_web_client_id": "xxxx",
       "oauth": {}
   };
   ```
   * If applicable, please provide your manual configuration example:
   ```
   {
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
        region: 'XX-XXXX-X',
        identityPoolRegion: 'XX-XXXX-X',
        userPoolId: 'XX-XXXX-X_abcd1234',
        userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',
        mandatorySignIn: false,
        authenticationFlowType: 'USER_PASSWORD_AUTH',
        oauth: {
            domain: 'your_cognito_domain',
            scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/',
            redirectSignOut: 'http://localhost:3000/',
            responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
           }
       }
   }
   ```
* If applicable, provide more configuration data, for example for Amazon Cognito, run `aws cognito-idp describe-user-pool --user-pool-id us-west-2_xxxxxx` (Be sure to remove any sensitive data)
 

<details>
  <summary><strong>Environment</strong></summary>

<!-- Please run the following command inside your project and copy/paste the output into the codeblock: -->

```
npx envinfo --system --binaries --browsers --npmPackages --npmGlobalPackages
```

</details>

**Smartphone (please complete the following information):**

- Device: [e.g. iPhone6]
- OS: [e.g. iOS8.1]
- Browser [e.g. stock browser, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.

**Is this a production issue?**
Are you experiencing this issue with a production application where end users are affected?

- [ ] (check box if yes)

**_You can turn on the debug mode to provide more info for us by setting window.LOG_LEVEL = 'DEBUG'; in your app._**