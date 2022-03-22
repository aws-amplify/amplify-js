# DataStore Lifecycle Events ("Start", "Stop", "Clear")

# DataStore Initialization ("Start")

**Understanding how DataStore starts is critical to understanding how DataStore fundamentally works.** At a high level, starting DataStore does the following things in order for each model:

> 1.  Init Schema
> 2.  Init the Storage Engine
> 3.  Migrate schema changes
> 4.  Sync Engine
> 5.  Empty the Outbox / processes the mutation queue
> 6.  Begin processing the subscription buffer
> 7.  DataStore is now in "ready" state

- _We can eagerly start DataStore by calling `DataStore.start`. Otherwise, invoking a method (query, save, delete, observe) will start it up._
- _Importing a models consumes `schema.js`, and creates the IndexedDB store._

## **How it works:**

1.  ### **Init schema**
    1. First we call `initSchema` [here](packages/datastore/src/datastore/datastore.ts)
    2. Codegen generates `schema.js` from the schema
    3. DataStore consumes `schema.js`.
2.  ### **Init the storage engine**
    1. Initialize the adapter
       - The local database gets created if it doesn’t exist already
       - The adapter [has a `setUp`](packages/datastore/src/storage/adapter/IndexedDBAdapter.ts#L82) method that then calls the database's `init` method
       - Nothing happens if you don't interact with DS, until first interaction
       - Establish relations
3.  ### **Migrate schema changes (if needed)**
    - See [schema-changes.md](./schema-changes.md)
    - If the user has updated the schema, we do the migration here.
4.  ### **Sync Engine**
5.  #### Instantiate Sync Engine

```
this.sync = new SyncEngine(
```

- The Sync Engine is only instantiated if there is a graphql endpoint (i.e. we’ve already provisioned the backend). Otherwise, DataStore is in local-only mode. See [datastore.ts](packages/datastore/src/datastore/datastore.ts#L735)
- **Note: at this step, we do not yet process the buffer**
- There are three subscriptions per model: `create`, `update`, and `delete`.

2. #### Sync engine is started (`syncSubscription = this.sync.start(`)

   1. ##### Subscribe to the Sync Engine

   - Messages from this subscription are emmited as Hub events for DataStore.
   - When ready, we call `initResolve`
   - If unauthorized, DS keeps working; we might have publicly readable models
   - If a validation error occurs, DataStore Sync breaks entirely
   - Without subscriptions, DataStore doesn’t work (when there is an endpoint present).
     - Subscriptions are the only component that updates the local store from remote.
   - If updates come in, they’re buffered to be processed after sync is complete.
   - SetupModels
     - prepares the sync predicates (similar to adapter setup)

   2. ##### Subscribe to DataStore connectivity (notifications about online / offline), observable

   - Component in Amplify Core for reachability
   - Why here?
     - Stop / Start sync process. If you go offline, we disconnect the websocket and stop syncing. If you go online, we reconnect the websocket and start base / delta syncing.
   - 
   const startPromise = new Promise(resolve => {
     this.datastoreConnectivity.status().subscribe(async ({ online }) => { - packages/datastore/src/sync/index.ts
   - Sync engine subscribes to the storage engine, observable
     - Every write may need to get translated to a mutation in the outbox
     - Storage engine is local source of truth for DS, other pieces are observing.
     - **RESUME HERE**

   3. ##### Run the Sync Queries (when online)
      1. **Overview:**
         1. Graphql queries necessary to hydrate the local store initially.
         2. The first time you run the app, for example, it will perform a query to perform a scan of dynamodb. Up to 10k per table. That populates the local store.
            1. Subsequent changes come in through subscriptions.
         3. Kind of like a list query, but with a start window, read from model metadata.
            1. Tries to use delta sync table.
            2. Else, uses a scan.
            3. The lastSync field is sent from server, not based on client - (I assume this is for full sync status)
      2. **How it works:**
         1. There are two mechanisms:
            1. Base sync - gets all records up to total sync value
         2. Delta sync
            1. One table per model, one delta sync table per DS store
         3. Process that knows which to use - appsync has final decision.
            1. TTL on all delta sync table records.
            2. AppSync, update data source, you can find TTL
            3. Client sends last sync param in sync query, service then compares the diff, if within, delta, otherwise base sync

3. ### **Empty the Outbox / processes the mutation queue**
   1. Example: when performing mutations offline, the records get added to the queue. Once there is connectivity, we start sending these **ONE BY ONE**.
   2. **Note: No batch API is exposed to consumers**
   3. Mutation events have ids.
   4. Syncs get applied before mutations are sent
4. ### **Begin processing the subscription buffer**
   1. If we receive subscription messages any time in the process of initializing subscriptions, performing sync queries, and processing the mutation queue, we buffer the subscription messages until everything else is completed. Once we have completed processing the mutation queue, we then process the subscription buffer.
5. ### **DataStore is now in "ready" state**

- For additional reference, and how the above are published as Hub events, see [the docs](https://docs.amplify.aws/lib/datastore/datastore-events/q/platform/js/)

## Stop

- Stops the DataStore sync process. This will close the real-time subscription connection when your app is no longer interested in updates. You will typically call DataStore.stop() just before your application is closed. You can also force your DataStore sync expressions to be re-evaluated at runtime by calling stop() followed by start().

## Clear

- Clears local data from DataStore. DataStore will now require a full sync (not a delta sync) to populate the local store with data.
