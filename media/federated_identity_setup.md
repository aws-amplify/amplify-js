# Federated Identity Setup

## Google

* [AWS Developer Guide](http://docs.aws.amazon.com/cognito/latest/developerguide/google.html)
* [Google Developer Guide](https://developers.google.com/+/web/signin/)

## Facebook

* [AWS Developer Guide](http://docs.aws.amazon.com/cognito/latest/developerguide/facebook.html)
* [Facebook Developer Guide](https://developers.facebook.com/docs/facebook-login/web)

### localhost domain

By default `localhost` is invalid in  **App Domains**.

You'll need to **Add Platform**, add **Website**. Then put the localhost URL in to **Site URL**

## Amazon

* [AWS Developer Guide](http://docs.aws.amazon.com/cognito/latest/developerguide/amazon.html)
* [Register for Login with Amazon](https://developer.amazon.com/docs/login-with-amazon/register-web.html)
* [Amazon SDK for Login](https://developer.amazon.com/docs/login-with-amazon/javascript-sdk-reference.html)

Note that the ```Security Profile id``` is for setting up the AWS Cognito identity pool and the ```Client Id``` is used in those HOC functions.




