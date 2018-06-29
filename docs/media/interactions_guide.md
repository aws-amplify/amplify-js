---
---

# Interactions

AWS Amplify Interactions category enables AI-powered chatbots in your web or mobile apps. You can use *Interactions* to configure your backend chatbot provider and to integrate a chatbot UI into your app with just a single line of code.

**Amazon Lex**

AWS Amplify implements [Amazon Lex](https://aws.amazon.com/lex) as the default chatbots service. Amazon Lex supports creating conversational bots with the by the same deep learning technologies that power Amazon Alexa. To learn more about Amazon Lex, please visit [Amazon Lex Developer Guide)](https://docs.aws.amazon.com/lex/latest/dg/what-is.html).

## Create your Chatbot

You can create Amazon Lex chatbox either with Amazon Lex console or with AWS Mobile Hub. Creating a bot with Mobile Hub helps you to create user roles automatically with a simplified user interface. 

Regardless of how you create your chatbot, you can edit your bot in Amazon Lex console at a later time. The bots created with Mobile Hub has an automatically added *MOBILEHUB* suffix so you can easily locate them in Amazon Lex console.

To create a chatbot with AWS Mobile Hub, follow these steps;

1. Go to [AWS Mobile Hub console](https://console.aws.amazon.com/mobilehub/home).

2. Create a new Mobile Hub project or select an existing project to add a bot.

3. Go to your project details. Under *Add More Backend Features* section, select *Conversational Bots* option box.
![Mobile Hub]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/interactions_mobile_hub_add.jpg){: class="screencap" style="max-height:600px;"}  

4. Select one of the three sample bots or select *Import a bot* to use an existing bot. When you to import a bot, a list of your existing Amazon Lex bots will be displayed.
![Mobile Hub2]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/interactions_mobile_hub_select_bot.jpg){: class="screencap" style="max-height:400px;"}

5. When you select a sample bot, Mobile Hub creates your bot on Amazon Lex with sample intents and utterances. An intent performs an action in response to a natural language user input, while an utterance is a set of spoken or typed phrases that invoke your intent. You can learn more about how Amazon Lex chatbots work from the [Amazon Lex Developer guide](https://docs.aws.amazon.com/lex/latest/dg/what-is.html).
![Mobile Hub3]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/interactions_mobile_hub_sample_bot.jpg){: class="screencap" style="max-height:600px;"}

6. Click *Create a Bot*. Your bot is now ready to be integrated into your app.

**Editing Your Bot**
You can edit your bot and add new utterances or integrate with other AWS services by visiting [Amazon Lex console](https://console.aws.amazon.com/lex) any time.  
![Mobile Hub4]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/interactions_lex_console_edit_bot.jpg){: class="screencap" style="max-height:600px;"}
{: .callout .callout--info}

## Installation and Configuration

Please refer to [AWS Amplify Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config) for general setup. In this guide, you will learn about how you can and integrate a conversational bot that you have created in the previous step.

### Automated Setup

Run following CLI commands to get your chatbox configuration to your local development environment. You will need your app's Mobile Hub project ID.

```bash
$ npm install -g awsmobile-cli
$ cd my-app #Change to your project's root folder
$ awsmobile init xxxx-yyyy-4491-bd6e-256d74e2b451 # Use your AWS Mobile Hub project ID
```

**Retrieving your AWS Mobile Hub project id**
To retrieve your Mobile Hub project id, click *Integrate* button on your project in Mobile Hub console.
![Mobile Hub5]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}
/media/images/mobile_hub_app_detail.jpg){: class="screencap" style="max-height:350px;"}  
Then, click download link to get your `aws-exports.js` file which includes your Mobile Hub project id.
![Mobile Hub5]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/interactions_mobile_hub_configure.jpg){: class="screencap" style="max-height:400px;"}
{: .callout .callout--info}

In your app's entry point, i.e. App.js, import and load the configuration file `aws-exports.js` which has been created and replaced into `/src` folder in the previous step.

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);
```

### Manual Setup

With manual setup, you need to provide your auth credentials and bot details to configure your app:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
    region: 'us-east-1'
  },
  Interactions: {
    bots: {
      "BookTripMOBILEHUB": {
        "name": "BookTripMOBILEHUB",
        "alias": "$LATEST",
        "region": "us-east-1",
      },
    }
  }
});
```

## Working with the API

You can import *Interactions* module from 'aws-amplify' package to work with the API.

```js
import { Interactions } from 'aws-amplify';
```

#### send() Method

You can send a text message to chatbot backend with *send()* command. The method returns a promise that includes the chatbot response.

```js
import { Interactions } from 'aws-amplify';

let userInput = "I want to reserve a hotel for tonight";

// Provide a bot name and user input
const response = await Interactions.send("BookTripMOBILEHUB", userInput);

// Log chatbot response
console.log (response.message);
```

#### onComplete() Method

You can use *onComplete()* method to register a function to catch errors or chatbot confirmations when the session successfully ends.  

```js

var handleComplete = function (err, confirmation) {
    if (err) {
        alert('bot conversation failed')
        return;
    }
    alert('done: ' + JSON.stringify(confirmation, null, 2));

    return 'Trip booked. Thank you! what would you like to do next?';
}

Interactions.onComplete(botName, handleComplete );
```

## Using UI Components

For React and React Native apps, the simplest way to add a conversational UI into your app is to use our *ChatBot* Component.

*ChatBot* automatically renders a complete chat messaging interface that can be used out-of-the-box, or it can be customized using theming support. 

### Using with React

When using React, you can use *ChatBot* with following properties;

```html
<ChatBot
    title="My Bot"
    theme={myTheme}
    botName="BookTripMOBILEHUB"
    welcomeMessage="Welcome, how can I help you today?"
    onComplete={this.handleComplete.bind(this)}
    clearOnComplete={true}
/>
```

Following simple app shows how to use **ChatBot** component in a React app;

```js
import React, { Component } from 'react';
import Amplify, { Interactions } from 'aws-amplify';
import { ChatBot, AmplifyTheme } from 'aws-amplify-react';

// Imported default theme can be customized by overloading attributes
const myTheme = {
  ...AmplifyTheme,
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: '#ff6600'
  }
};

Amplify.configure({
  Auth: {
    // Use your Amazon Cognito Identity Pool Id
    identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
    region: 'us-east-1'
  },
  Interactions: {
    bots: {
      "BookTripMOBILEHUB": {
        "name": "BookTripMOBILEHUB",
        "alias": "$LATEST",
        "region": "us-east-1",
      },
    }
  }
});

class App extends Component {

  handleComplete(err, confirmation) {
    if (err) {
      alert('Bot conversation failed')
      return;
    }

    alert('Success: ' + JSON.stringify(confirmation, null, 2));
    return 'Trip booked. Thank you! what would you like to do next?';
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to ChatBot Demo</h1>
        </header>
        <ChatBot
          title="My Bot"
          theme={myTheme}
          botName="BookTripMOBILEHUB"
          welcomeMessage="Welcome, how can I help you today?"
          onComplete={this.handleComplete.bind(this)}
          clearOnComplete={true}
        />
      </div>
    );
  }
}

export default App;
```

### Using with React Native

When using React Native, you can use *ChatBot* with following properties;

```html
<ChatBot
    botName={botName}
    welcomeMessage={welcomeMessage}
    onComplete={this.handleComplete}
    clearOnComplete={false}
    styles={StyleSheet.create({
        itemMe: {
            color: 'red'
        }
    })}
/>
```

Following simple app shows how to use **ChatBot** component in a React Native app;

 ```js
import React from 'react';
import { StyleSheet, Text, SafeAreaView, Alert, StatusBar } from 'react-native';
import Amplify from 'aws-amplify';
import { ChatBot } from 'aws-amplify-react-native';

Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
    region: 'us-east-1'
  },
  Interactions: {
    bots: {
      "BookTripMOBILEHUB": {
        "name": "BookTripMOBILEHUB",
        "alias": "$LATEST",
        "region": "us-east-1",
      },
    }
  }
});

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: StatusBar.currentHeight,
  },
});

export default class App extends React.Component {

    state = {
        botName: 'BookTripMOBILEHUB',
        welcomeMessage: 'Welcome, what would you like to do today?',
    };

    constructor(props) {
        super(props);
        this.handleComplete = this.handleComplete.bind(this);
    }

    handleComplete(err, confirmation) {
        if (err) {
        Alert.alert('Error', 'Bot conversation failed', [{ text: 'OK' }]);
        return;
        }

        Alert.alert('Done', JSON.stringify(confirmation, null, 2), [{ text: 'OK' }]);

        this.setState({
        botName: 'BookTripMOBILEHUB',
        });

        return 'Trip booked. Thank you! what would you like to do next?';
    }

    render() {
        const { botName, showChatBot, welcomeMessage } = this.state;

        return (
        <SafeAreaView style={styles.container}>
            <ChatBot
            botName={botName}
            welcomeMessage={welcomeMessage}
            onComplete={this.handleComplete}
            clearOnComplete={false}
            styles={StyleSheet.create({
                itemMe: {
                color: 'red'
                }
            })}
            />
        </SafeAreaView>
        );
    }

}
 ```

### API Reference

For the complete API documentation for Interactions module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/interactions.html)
{: .callout .callout--info}
