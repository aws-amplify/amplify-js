# Onboarding with DataStore

## Understand the primary DataStore events
- Read the [DataStore lifecycle events doc](docs/datastore-lifecycle-events.md)

## Building a sample app with DataStore to understand how it works
1. Build a basic DataStore sample app (no @auth, just 1-2 models).
2. Build a similar sample app with the API category.
3. Add @auth rules to the DataStore app from *step 2*:
    1. `amplify update api`
    2. Modify schema according to auth rules docs (https://docs.amplify.aws/lib/datastore/setup-auth-rules/q/platform/js).
    3. `amplify push`
    4. `amplify codegen models`
4. Add [selective sync](https://docs.amplify.aws/lib/datastore/sync/q/platform/js#selectively-syncing-a-subset-of-your-data).
5. Enable [real-time changes](https://docs.amplify.aws/lib/datastore/real-time/q/platform/js).
6. While interacting with your app, examine the Application > IndexedDB sections of dev tools:
    1. Check out the different stores in IDB that get created for your schema. Note the internal stores prefixed with sync_, and the stores corresponding to your models prefixed with user_.
    2. Familiarize yourself with how actions taken in the UI affect the data stored in IDB. This may be easier to do while throttling the network connection. You'll be able to see how outgoing mutations first get persisted into the corresponding store, then added to the mutation queue / outbox (sync_MutationEvent), and then updated in the store with data from AppSync.
7. Turn on DEBUG logging (`Amplify.Logger.LOG_LEVEL = "DEBUG";`) at the root of your project, and inspect the logs in the console while using your app. Additionally, [enable hub events](https://docs.amplify.aws/lib/datastore/datastore-events/q/platform/js#usage) for DataStore
8. The best way to understand events is to place several debuggers, or breakpoints, throughout DataStore.
    - With logging / Hub events enabled, you can see what operations DataStore is performing (i.e. start, sync, etc.) as you step through with the debugger.
9. Testing offline scenerios / concurrent user sessions is a useful way to test the full functionality of DataStore.