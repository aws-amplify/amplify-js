# Local database examples:

TODO: combine with namespaces


- *Note: Anything prepended with `sync\_` is an internal table.*

- datastore_Setting
    - Used for schema versioning
    - See the [schema changes doc](docs/schema-changes.md)
    ```
	{
		id: "01FYABF3DMBZZJ46W1CC214NH2"
		key: "schemaVersion"
		value: "\"4401034582a70c60713e1f7f9da3b752\""
	}
	```
- sync_ModelMetadata
    - Sync Engine metadata
	```
	{
		fullSyncInterval: 86400000
		id: "01FYABF3DMBZZJ46W1CC214NH3"
		lastFullSync: 1647467532307
		lastSync: 1647467532307
		lastSyncPredicate: null
		model: "Todo"
		namespace: "user"
	}
	```
- sync_MutationEvent
- user_[Model Name]
    - The actual records themselves.
	```
	{
		createdAt: "2022-03-16T21:52:07.718Z"
		description: null
		id: "6f69055b-b081-4225-8fc4-1d6d52732660"
		name: "name 1647467527489"
		updatedAt: "2022-03-16T21:52:07.718Z"
		_deleted: null
		_lastChangedAt: 1647467527754
		_version: 1
	}
	```