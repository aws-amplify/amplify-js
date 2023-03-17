## Helper functions for DataStore testing

Please try to keep things clean.

In particular, let's try to to keep file sizes smaller and more "categorical" in order to:

1. Make finding and discovering test utils easier
2. Reduce excessive vertical scrolling
3. Reduce complexity of merge conflicts
4. _<< And other awesome benefits I haven't thought of! >>_

Intended organization is as follows:

|                       | Intent                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `fakes/*`             | Util classes to inject and/or observe datastore's interaction with its boundaries, like cloud/graphql storage.        |
| `schemas/*`           | Schema JSON and model types (Plenty of room for further refactoring and reorganization here!)                         |
| `datastoreFactory.ts` | Function(s) for creating clean, test-configured initializations of DataStore and deps to test against.                |
| `util.ts`             | Miscellaneous, mostly-isolated utility functions to aid with testing. (To be further decomposed as-needed over time.) |

There's almost always room to clean things up and do better. If you encounter a merge conflict that would have benefitted from chunks of code living separately; submit a refactor-only PR to separate them. If you get "lost" vertically scrolling in a file, look for a semantically meaningful boundary to separate on. If you can't find what you're looking for, consider whether another folder/category to drill into would have helped.

If you have any ideas around taming the rather large test schemas, making it easier to add new models and corresponding JSON, submit a PR with your idea! Etc..

Thanks!
