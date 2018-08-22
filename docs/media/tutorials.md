<html>
  <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->     <script async src="https://www.googletagmanager.com/gtag/js?id=UA-115615468-1"></script>     <script>         window.dataLayer = window.dataLayer || [];         function gtag(){dataLayer.push(arguments);}         gtag('js', new Date());         gtag('config', 'UA-115615468-1',{             'linker': {             'domains': ['aws-amplify.github.io']             }         });         var navigateToNextPage = function (elem) {             var path = "{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start";             location.replace( path + location.search);         };       gtag('event', 'page_view', {         'event_callback': navigateToNextPage         });     </script> <meta http-equiv="refresh" content="5; url={% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start" />
  </head>
  <body>
    <p>Redirecting to <a href="{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start">https://aws-amplify.github.io/amplify-js/media/quick_start</a></p>
  </body>
</html>
---

# Page settings
layout: tutorials
keywords:


# Grid navigation
marketing_grid:
    - title: Tutorials
      excerpt: <span>AWS Amplify tutorials and training videos for web and mobile development. </span>

      
# Grid navigation

tutorial_list:

    - category: GetStarted
      title: Get Started
      subs:
        - title: Building Web Apps with AWS Amplify
          excerpt: 'A step-by-step tutorial for learning how to build a cloud-enabled React Web app with AWS Amplify.<br/><b>30 min to complete</b>'
          cta: Read more
          url: '/media/tutorials/building-web-apps'
        - title: Building React Native Apps with AWS Amplify
          excerpt: 'A step-by-step tutorial for learning how to build a cloud-enabled mobile app with React Native and AWS Amplify.<br/><b>30 min to complete</b>'
          cta: Read more
          url: '/media/tutorials/building-react-native-apps' 
        - title: Building Ionic 4 apps with AWS Amplify
          excerpt: "Learn to build a cloud enabled 'Notes App' with Ionic 4 and AWS Amplify <br/><b>45 min to complete</b>"
          cta: Read more
          url: '/media/tutorials/building-ionic-4-apps' 
    -  category: CommunityResources
       title: Working with AWS Amplify
       subs:
        - title: How to use AWS Amplify and Angular to Build Cloud Enabled JavaScript Applications
          excerpt: 'Learn how to start working with AWS Amplify in an Angular app.<br/><b>5 min read</b>'
          cta: Read more
          url_external: 'https://medium.freecodecamp.org/building-cloud-enabled-javascript-applications-with-aws-amplify-angular-682547fc6477'
          tags: Angular
          by: Nader Dabit
        - title: Adding AWS Amplify to an Ember.js Application
          excerpt: 'Learn how to start working with AWS Amplify in an Ember app.<br/><b>5 min read</b>'
          cta: Read more
          url_external: 'https://itnext.io/adding-aws-amplify-to-an-ember-js-application-72683167c476'
          tags: Ember.js
          by: Michael Labieniec
        - title: Building Serverless Mobile Applications with React Native & AWS
          excerpt: 'Learn to build fully serverless & backendless mobile applications with AWS Amplify and React Native.<br/><b>12 min read</b>'
          cta: Read more
          url_external: 'https://medium.com/react-native-training/building-serverless-mobile-applications-with-react-native-aws-740ecf719fce'
          tags: React Native
          by: Nader Dabit
        - title: Adding Analytics to Your Next Mobile JavaScript Application
          excerpt: 'Add in-depth, production ready analytics to your application in minutes using AWS Amplify & AWS Mobile Hub.<br/><b>6 min read</b>'
          cta: Read more
          url_external: 'https://hackernoon.com/adding-amazon-pinpoint-analytics-to-your-next-mobile-javascript-application-24ad49557a6f'
          tags: Analytics
          by: Nader Dabit
        - title: React Native iOS Push Notifications with AWS & Amazon Pinpoint
          excerpt: 'In this video, we will walk through how to add Push Notifications to a React Native iOS Project using AWS Amplify, AWS Mobile Hub, and Amazon Pinpoint.<br/><b>26 min</b>'
          cta: '<b>Watch</b>'
          url_external: 'https://www.youtube.com/watch?v=um-DIIRsFlM'
          tags: 
            - React Native
            - Notifications
          by: Nader Dabit
        - title: Introducing the AWS Amplify GraphQL Client
          excerpt: 'A first look at how to build client side GraphQL applications using AWS Amplify.<br/><b>5 min read</b>'
          cta: Read more
          url_external: 'https://hackernoon.com/introducing-the-aws-amplify-graphql-client-8a1a1e514fde'
          tags: GraphQL
          by: Nader Dabit
        - title: Building ChatBots with React & AWS
          excerpt: 'Learn how to leverage AWS Amplify, AWS Lambda, & Amazon Lex to build a functioning chatbot.<br/><b>12 min read</b>'
          cta: Read more
          url_external: 'https://tylermcginnis.com/building-chatbots-with-react-aws/'
          tags: Chatbots
          by: Nader Dabit
        - title: Building a Custom UI for Authentication with AWS Amplify
          excerpt: "Learn how to customize AWS Amplify's Authenticator component.<br/><b>6 min read</b>"
          cta: Read more
          url_external: 'https://itnext.io/building-a-custom-ui-for-authentication-with-aws-amplify-fa13bdbd4d1d'
          tags: Authentication
          by: Adrian Hall

---
