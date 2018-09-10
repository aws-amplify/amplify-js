--- 
---
# I18n

AWS Amplify I18n module is a lightweight internationalization solution.

## Installation

```js
import { I18n } from 'aws-amplify';

// or 
import { I18n } from '@aws-amplify/core';
```

## Working with the API

### setLanguage()

Sets the active language.

```js
I18n.setLanguage('fr');
```

In browser, Amplify detects browser language automatically. For mobile may want to use other libraries to detect the language, and you can set to Amplify in your code.
{: .callout .callout--info}

### putVocabularies()

You can create your custom dictionary is set is as your `vocabularies` in your app. Dictionary is JavaScript object that you can implement with different terms and languages.

```js
const dict = {
    'fr': {
        'Sign In': "Se connecter",
        'Sign Up': "S'inscrire"
    },
    'es': {
        'Sign In': "Registrarse",
        'Sign Up': "Regístrate"
    }
};

I18n.putVocabularies(dict);
```

### get()

Retrieves a phrase from the dictionary for the active language. If the phrase does not have an entry in dictionary, the original parameter value will be returned.

```js
I18n.get('Sign In');
```

### API Reference

For the complete API documentation for i18n module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/i18n.html)
{: .callout .callout--info}
