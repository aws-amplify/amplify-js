---
# Page settings
layout: categories
keywords:


# Grid navigation
marketing_grid:
    - title: Developer Guide
      excerpt: AWS Amplify comes with building blocks for frontend and mobile developers to interact with the Cloud. You can mix and match the categories below as needed.

      
# Grid navigation
category_list:
    - category: Modules
      title: Modules
      subs:
        - title: Analytics 
          excerpt: Drop-in analytics to track user sessions, custom user attributes, and in-app metrics.
          cta: Read more
          class: aws-icon-ps-60-pie-bar-charts 
          url: '/media/analytics_guide'
          services:
            - title: AWS Pinpoint,
              url: https://aws.amazon.com/cognito/
            - title: AWS Kinesis,
              url: https://aws.amazon.com/kinesis/
            - title: Custom Plugin
              url: 
        - title: API 
          excerpt: A simple and secure solution for making HTTP requests.
          cta: Read more
          class: aws-icon-ps-60-database-server
          url: '/media/api_guide'    
          services:
            - title: AWS API Gateway
              url: https://aws.amazon.com/api-gateway
        - title: Authentication
          excerpt:  Authentication APIs with pre-built UI components for your app.  
          cta: Read more
          class: aws-icon-ps-60-shield-circle
          url: '/media/authentication_guide'
          services:
            - title: AWS Cognito ,
              url: https://aws.amazon.com/cognito
            - title: OAuth 2.0 ,
              url: https://aws.amazon.com/cognito
            - title: Custom Plugin
              url:   
        - title: Storage 
          excerpt: A simple mechanism for managing user content in public or private storage.
          cta: Read more
          class: aws-icon-ps-60-file-box
          url: '/media/storage_guide'   
          services:
              - title: AWS S3
                url: https://aws.amazon.com/s3
    -  category: Utilities
       title: Utilities
       subs:
        - title: Cache 
          excerpt: A generic LRU cache for storing data with priority and expiration settings. 
          cta: Read more
          url: '/media/cache_guide'  
        - title: Hub  
          excerpt: A lightweight Pub-Sub system.
          cta: Read more
          url: '/media/hub_guide' 
        - title: I18n  
          excerpt: A lightweight internationalization solution.
          cta: Read more
          url: '/media/i18n_guide'  
        - title: Logger  
          excerpt: Console logging utility.
          cta: Read more
          url: '/media/logger_guide'  

---


# Developer Guide

AWS Amplify is a library with building blocks for frontend and mobile developers to interact with the Cloud. You can mix and match the categories below as needed.

* [Authentication](authentication_guide.md)
* [Analytics](analytics_guide.md)
* [API](api_guide.md)
* [Storage](storage_guide.md)
* [Cache](cache_guide.md)
* Utilities
  - [I18n](i18n_guide.md)
  - [Logger](logger_guide.md)
  - [Hub](hub_guide.md)
