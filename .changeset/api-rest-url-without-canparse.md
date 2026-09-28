---
'@aws-amplify/api-rest': patch
---

fix(api-rest): resolve REST API URLs in browsers that don't implement `URL.canParse`, instead of failing with "API name is invalid"
