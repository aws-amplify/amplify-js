# Storage
## Adapters:
- Web
   - [IndexedDB](../src/storage/adapter/IndexedDBAdapter.ts)
- Mobile
   - React Native
      - [Async Storage](../src/storage/adapter/AsyncStorageAdapter.ts) (can opt in to use SQLite)
- SSR
   - [InMemoryStore](../src/storage/adapter/InMemoryStore.ts)

## How we determine which adapter to use

We determine the storage adapter [here](../src/storage/adapter/getDefaultAdapter/index.ts). 


## The Storage class
- The [Storage class](../src/storage/storage.ts) is what interacts with the adapters.

## Storage Adapters
   1. There is one adapter per database type we support (i.e. three adapters).
   2. Each adapter provides a unified API for the storage engine to interact with.
   3. The SQLite adapter lives [in it’s own package](https://github.com/aws-amplify/amplify-js/tree/main/packages/datastore-storage-adapter).
   4. **ExclusiveStorage wraps storage public methods (e.g. `Storage.runExclusive`)**
      1. Guarantees consistency
      2. Makes the storage class transactional
      3. **Provides concurrency control**

## How DataStore finds records locally:
- Varies by storage adapter
- [SQLiteAdapter](https://github.com/aws-amplify/amplify-js/tree/main/packages/datastore-storage-adapter): DataStore constructs a query. 
- [Async Storage](../src/storage/adapter/AsyncStorageAdapter.ts): DataStore scans and filters. 
- [IndexedDB](../src/storage/adapter/IndexedDBAdapter.ts): if the query is by primary key, DataStore queries against the index, otherwise it scans and filters.
   - *Note: The lazy loading branch includes an improvement to the IndexedDB adapter wherein it will check if any search criteria can meaningfully leverage an index (there is no preference for low cardinality; the first identified index is used.) If so, the base result is sourced from the index and the remaining criteria will be applied as a filter.*