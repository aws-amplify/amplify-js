Access Your APIs
================

About Hosting and Streaming
---------------------------

The AWS Mobile Hosting and Streaming &lt;hosting-and-streaming&gt;
feature is especially useful to web developers. It uses the ability of
[Amazon
S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html)
buckets to statically host content and the [Amazon
CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
content distribution network (CDN) to host on an endpoint close to every
user globally. Amazon CloudFront endpoints can also stream media
content.

**About the Hosting and Streaming Sample App**

When you enable Hosting and Streaming , provisions content in the root
of your source bucket which includes a local copy of the (aws-min.js).

-   aws-sdk.min.js - An source file.
-   aws-config.js,- A web app configuration file that is generated to
    contain constants for the endpoints for each feature you have
    enabled for this project.
-   index.html - Which uses a constant formed in aws-config.js to
    request and display an AWS guest (unauthenticated) user identity ID
    from the service.

When you enable Hosting and Streaming an global content delivery network
(CDN) distribution is created and associated with your bucket. When
propagates the sample web app content to the bucket, the content is then
propagated to the CDN and becomes available from local endpoints around
the globe. If you configure [CloudFront
streaming](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Tutorials.html),
then media content you upload to your bucket can be streamed from those
endpoints.

\*\* To view the Hosting and Streaming Sample App

The Hosting and Streaming feature creates a sample JavaScript web app
that demonstrates connecting to the AWS resources of your project.

The sample app web assets are deployed to an bucket. The bucket is
configured to host static web content for public access.

1.  In the [Mobile Hub
    console](https://console.aws.amazon.com/mobilehub/home/), open your
    project and then choose the Hosting and Streaming tile.
2.  Choose View from S3.

    This opens a browser and displays the index.html of the sample web
    app from the bucket.

    > ![Image of the |AMH| console.](images/add-aws-mobile-add-hosting-and-streaming-view-from-s3.png)

Configure a Custom Domain for Your Web App
------------------------------------------

> To use your custom domain for linking to your Web app, use the service
> to configure DNS routing.
>
> For a web app hosted in a single location, see [Routing Traffic to a
> Website that Is Hosted in an Amazon S3
> Bucket](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/RoutingToS3Bucket.html).
>
> For a web app distributed through a global CDN, see [Routing Traffic
> to an Amazon CloudFront Web Distribution by Using Your Domain
> Name](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloud-fron-distribution.html)
