
# AWS Amplify Visual Studio Code Extension

<img src="https://s3.amazonaws.com/aws-mobile-hub-images/aws-amplify-logo.png" alt="AWS Amplify" width="550" >

Visual Studio Code code snippets and completion support for the [AWS Amplify](https://aws.github.io/aws-amplify).

## Installation

Go to the *Extension Marketplace* in VS Code and search for AWS Amplify. Click install on the extension with title "AWS Amplify API".

## Usage

In a JavaScript or JSX file*, start typing an AWS Amplify API command and choose the appropriate snippet either by clicking it or pressing "enter" or "tab" when the correct snippet is highlighted in the drop-down menu. You can scroll between snippets using the up and down arrow keys.

The snippet options that pop up are based on the prefix that you type. For the complete set of prefix/snippet pairings for AWS Amplify, see the [documentation](https://github.com/aws-amplify/amplify-js/wiki/VS-Code-Snippet-Extension#full-code-block-snippet-documentation). 

## Naming convention

The naming convention for code snippets is "Amplify " + action prefix. So, in the code editor, you can type:
```
Amplify Update User Attributes
```
to output the related code block:

![Alt Text](gifs/update_endpoint_example.gif)

The code blocks with the same name are displayed in their order, e.g. 3rd snippet for "Analytics Installation And Configuration" will have the prefix "Amplify Analytics Installation And Configuration 3".

## Single word snippets

The list of single word snippets is provided in the [documentation](https://github.com/aws-amplify/amplify-js/wiki/VS-Code-Snippet-Extension#single-word-snippet-documentation).
