--- 
---
# I18n

AWS Amplify I18n module is a lightweight internationalization solution.

* [Language Detection](#language-detection)
* [Dictionary](#dictionary)
* [Translate](#translate)

## Language Detection

In browser, Amplify detects browser language. On mobile, there is no common way from vendor. You may want to use other libraries to get the language and set to Amplify.

```js
import { I18n } from 'aws-amplify';

I18n.setLanguage('fr');
```

## Dictionary

Dictionary is fed by your vocabularies, which in essence, is a Javascript object
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

## Translate
If the phrase does not have an entry in dictionary, the original will be returned.

```js
    I18n.get('Sign In');
```
