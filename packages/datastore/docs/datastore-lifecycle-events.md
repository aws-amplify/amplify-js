# DataStore Lifecycle Events ("Start", "Stop", "Clear")

# DataStore Initialization ("Start")

**Understanding how DataStore starts is critical to understanding how DataStore fundamentally works.** At a high level, starting DataStore does the following things in order for each model (TODO: add links, underline primary sections):

> 1.  Init Schema
> 2.  Init the Storage Engine
> 3.  Migrate schema changes
> 4.  Sync Engine Operations
> 5.  Empty the Outbox / processes the mutation queue
> 6.  Begin processing the subscription buffer
> 7.  DataStore is now in "ready" state

- _We can eagerly start DataStore by calling `DataStore.start`. Otherwise, invoking a method (query, save, delete, observe) will start it up_
- _When importing a model, DS consumes `schema.js`, and creates the IndexedDB store._

## **How it works:**

1.  ### **Init schema**
    - **1.1** First we call `initSchema` [here](packages/datastore/src/datastore/datastore.ts)
    - **2.2** Codegen then generates `schema.js` from the schema
    - **3.3** DataStore consumes `schema.js`

2.  ### **Init the storage engine**
    - The adapter is initialized
    - The local database gets created if it doesn’t exist already
    - The adapter [has a `setUp`](packages/datastore/src/storage/adapter/IndexedDBAdapter.ts#L82) method that then calls the database's `init` method
    - Relations are established
    - Nothing happens until the first interaction with DataStore

3.  ### **Migrate schema changes (if needed)**
    - See [schema-changes.md](./schema-changes.md)
    - If the user has updated the schema, we perform the migration here

4.  ### **Sync Engine Operations**
5.  #### Instantiate Sync Engine (`this.sync = new SyncEngine(`)
    - The Sync Engine is only instantiated if there is a graphql endpoint (meaning we’ve already provisioned the backend). Otherwise, DataStore is in local-only mode. See [datastore.ts](packages/datastore/src/datastore/datastore.ts#L735)
    - **Note: at this step, we do not yet process the buffer**
    - There are three subscriptions per model: `create`, `update`, and `delete`

6. #### Sync Engine is started (`syncSubscription = this.sync.start(`)
    - **6.1 Subscribe to the Sync Engine**
      - Messages from this subscription are emmited as Hub events for DataStore
      - When ready, we call `initResolve`
      - If unauthorized, DS keeps working, as we may have publicly readable models
      - If a validation error occurs, DataStore Sync breaks entirely
      - Without subscriptions, DataStore doesn’t work (when there is an endpoint present)
      - Subscriptions are the only component that update the local store from remote
      - If updates come in, they’re buffered to be processed after sync is complete
      - Prepares the sync predicates (similar to adapter setup)

    - **6.2 Subscribe to DataStore connectivity observable (notifications about network status)**
        - `this.datastoreConnectivity.status().subscribe`
        - Subscribe Amplify Core component that monitors network reachability
        - We do this here because we need the ability to stop or start the sync process. When offline, we disconnect the websocket and stop syncing. Once online, we reconnect the websocket and start base / delta syncing
        - Sync engine subscribes to the Storage Engine
            - Every write may need to get translated to a mutation in the outbox
            - Storage engine is local source of truth for DataStore, all other pieces are observing

    - **6.3 Run the Sync Queries (when online)**
        - _Note: We perform a topological sort of the data - we sync the children first, so when we query the parent, the children are already present We also use an optimisation to parallelize this process if possible (i.e. non-dependent models)_
        - Sync queries are Graphql queries that are necessary to hydrate the local store initially
        - The first time we run the app, we will perform a query to perform a scan or query of DynamoDB with up to 10k records per table. This populates the local store. With selective sync, we perform a query instead of a scan against DynamoDB.
        - Subsequent changes after the initial sync query come in through subscriptions
        - There are two mechanisms:
            - Base sync - retrieve all records up to total sync value
            - Delta sync - one table per model, one delta sync table per DS store
        - AppSync makse the final decision regarding which sync (base vs delta) to perform
            - The client sends the last sync param with the sync query, service then compares the diff
            - There is a TTL on all delta sync table records
            - To find the TTL within the AppSync Console, see "Update Data Source"

7. ### **Empty the Outbox / processes the mutation queue**
    - Example: when performing mutations offline, records are added to the queue. Once there is connectivity, we start sending these **ONE BY ONE**.
    - **Note: No batch API is exposed to consumers**
    - Mutation events have ids
    - Syncs get applied before mutations are sent
8. ### **Begin processing the subscription buffer**
    - If we receive subscription messages any time in the process of initializing subscriptions, performing sync queries, or processing the mutation queue, we buffer the subscription messages until everything else is completed. Once we have completed processing the mutation queue, we then process the subscription buffer
9. ### **DataStore is now in "ready" state**
    - For additional reference, and how the above are published as Hub events, see [the docs](https://docs.amplify.aws/lib/datastore/datastore-events/q/platform/js/)

## Stop
    - Stops the DataStore sync process. This will close the real-time subscription connection when your app is no longer interested in updates. You will typically call DataStore.stop() just before your application is closed. You can also force your DataStore sync expressions to be re-evaluated at runtime by calling stop(), followed by start()

## Clear
    - Clears local data from DataStore. DataStore will now require a full sync (not a delta sync) to populate the local store with data
