Access Your APIs
================

The AWS Mobile CLI and Amplify library make it easy to create and call
cloud APIs and their handler logic from your JavaScript.

Set Up Your Backend
-------------------

### Create Your API

In the following examples you will create an API that is part of a
cloud-enabled number guessing app. The CLI will create a serverless
handler for the API behind the scenes.

**To enable and configure an API**

1.  In the root folder of your app, run:

    ``` {.sourceCode .bash}
    awsmobile cloud-api enable --prompt
    ```

2.  When prompted, name the API Guesses.

    ``` {.sourceCode .bash}
    ? API name: Guesses
    ```

3.  Name a HTTP path /number. This maps to a method call in the API
    handler.

    ``` {.sourceCode .bash}
    ? HTTP path name (/items): /number
    ```

4.  Name your Lambda API handler function guesses.

    ``` {.sourceCode .bash}
    ? Lambda function name (This will be created if it does not already exists): guesses
    ```

5.  When prompted to add another HTTP path, type N.

    ``` {.sourceCode .bash}
    ? Add another HTTP path (y/N): N
    ```

6.  The configuration for your Guesses API is now saved locally. Push
    your configuration to the cloud.

    ``` {.sourceCode .bash}
    awsmobile push
    ```

**To test your API and handler**

From the command line, run:

``` {.sourceCode .bash}
awsmobile cloud-api invoke Guesses GET /number
```

The Cloud Logic API endpoint for the `Guesses`{.sourceCode} API is now
created.

### Customize Your API Handler Logic

The AWS Mobile CLI has generated a Lambda function to handle calls to
the `Guesses`{.sourceCode} API. It is saved locally in
YOUR-APP-ROOT-FOLDER/awsmobilejs/backend/cloud-api/guesses. The app.js
file in that directory contains the definitions and functional code for
all of the paths that are handled for your API.

**To customize your API handler**

1.  Find the handler for POST requests on the `/number`{.sourceCode}
    path. That line starts with `app.post('number',`{.sourceCode}.
    Replace the callback function’s body with the following:

    ``` {.sourceCode .javascript}
    # awsmobilejs/backend/cloud-api/guesses/app.js
    app.post('/number', function(req, res) {
      const correct = 12;
      let guess = req.body.guess
      let result = ""

      if (guess === correct) {
        result = "correct";
      } else if (guess > correct) {
        result = "high";
      } else if (guess < correct) {
        result = "low";
      }

      res.json({ result })
    });
    ```

2.  Push your changes to the cloud.

    ``` {.sourceCode .bash}
    awsmobile push
    ```

The `Guesses`{.sourceCode} API handler logic that implements your new
number guessing functionality is now deployed to the cloud.

Connect to Your Backend
-----------------------

The examples in this section show how you would integrate AWS Amplify
library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify/) to use other flavors
of Javascript).

The following simple component could be added to a
`create-react-app`{.sourceCode} project to present the number guessing
game.

### Make a Guess

The `API`{.sourceCode} module from AWS Amplify allows you to send
requests to your Cloud Logic APIs right from your JavaScript
application.

**To make a RESTful API call**

1.  Import the `API`{.sourceCode} module from `aws-amplify`{.sourceCode}
    in the `GuessNumber`{.sourceCode} component file.

    ``` {.sourceCode .javascript}
    import { API } from 'aws-amplify';
    ```

2.  Add the `makeGuess`{.sourceCode} function. This function uses the
    `API`{.sourceCode} module’s `post`{.sourceCode} function to submit a
    guess to the Cloud Logic API.

    ``` {.sourceCode .javascript}
    async makeGuess() {
      const guess = parseInt(this.refs.guess.value);
      const body = { guess }
      const { result } = await API.post('Guesses', '/number', { body });
      this.setState({
        guess: result
      });
    }
    ```

3.  Change the Guess button in the component’s `render`{.sourceCode}
    function to invoke the `makeGuess`{.sourceCode} function when it is
    chosen.

    ``` {.sourceCode .javascript}
    <button type="submit" onClick={this.makeGuess.bind(this)}>Guess</button>
    ```

Open your app locally and test out guessing the number by running
`awsmobile run`{.sourceCode}.

Your entire component should look like the following:

### Next Steps

-   Learn how to retrieve specific items and more with the [API module
    in AWS
    Amplify](https://aws.github.io/aws-amplify/media/developer_guide.html).
-   Learn how to enable more features for your app with the [AWS Mobile
    CLI](https://aws.github.io/aws-amplify).
-   Learn more about what happens behind the scenes, see [Set up Lambda
    and API
    Gateway](https://alpha-docs-aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html).

