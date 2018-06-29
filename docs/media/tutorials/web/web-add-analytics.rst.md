Add Analytics
=============

Basic Analytics Backend is Enabled for Your App
-----------------------------------------------

When you complete the AWS Mobile CLI setup and launch your app,
anonymized session and device demographics data flows to the AWS
analytics backend.

**To send basic app usage analytics to AWS**

Launch your app locally by running:

``` {.sourceCode .bash}
npm start
```

When you use your app the [Amazon
Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/)
service gathers and visualizes analytics data.

**To view the analytics using the Amazon Pinpoint console**

1.  Run `npm start`{.sourceCode}, `awsmobile run`{.sourceCode}, or
    `awsmobile publish --test`{.sourceCode} at least once.
2.  Open your project in the [AWS Mobile Hub
    console](https://console.aws.amazon.com/mobilehub/).

    ``` {.sourceCode .bash}
    awsmobile console
    ```

3.  Choose the Analytics icon on the left, to navigate to your project
    in the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/).
4.  Choose Analytics on the left.

You should see an up-tick in several graphs.

Add Custom Analytics to Your App
--------------------------------

You can configure your app so that [Amazon
Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/)
gathers data for custom events that you register within the flow of your
code.

**To instrument custom analytics in your app**

In the file containing the event you want to track, add the following
import:

``` {.sourceCode .java}
import { Analytics } from 'aws-amplify';
```

Add the a call like the following to the spot in your JavaScript where
the tracked event should be fired:

``` {.sourceCode .javascript}
componentDidMount() {
   Analytics.record('FIRST-EVENT-NAME');
}
```

Or to relevant page elements:

``` {.sourceCode .html}
handleClick = () => {
     Analytics.record('SECOND-EVENT-NAME');
}

<button onClick={this.handleClick}>Call request</button>
```

To test:

1.  Save the changes and run `npm start`{.sourceCode},
    `awsmobile run`{.sourceCode}, or
    `awsmobile publish --test`{.sourceCode} to launch your app. Use your
    app so that tracked events are triggered.
2.  In the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/), choose Events
    near the top.
3.  Select an event in the Event dropdown menu on the left.

Custom event data may take a few minutes to become visible in the
console.

Next Steps
----------

Learn more about the analytics in AWS Mobile which are part of the
Messaging and Analytics &lt;messaging-and-analytics&gt; feature. This
feature uses [Amazon
Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html).

Learn about AWS Mobile CLI &lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify).
