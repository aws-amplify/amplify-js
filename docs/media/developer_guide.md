<html>
  <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->     <script async src="https://www.googletagmanager.com/gtag/js?id=UA-115615468-1"></script>     <script>         window.dataLayer = window.dataLayer || [];         function gtag(){dataLayer.push(arguments);}         gtag('js', new Date());         gtag('config', 'UA-115615468-1',{             'linker': {             'domains': ['aws-amplify.github.io']             }         });         var navigateToNextPage = function (elem) {             var path = "{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start";             location.replace( path + location.search);         };       gtag('event', 'page_view', {         'event_callback': navigateToNextPage         });     </script> <meta http-equiv="refresh" content="5; url={% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start" />
  </head>
  <body>
    <p>Redirecting to <a href="{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start">https://aws-amplify.github.io/amplify-js/media/quick_start</a></p>
  </body>
</html>