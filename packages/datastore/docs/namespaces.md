# Namespaces
- export enum NAMESPACES {
	DATASTORE = 'datastore', - settings
	USER = 'user', - user data (models that came from user schema)
	SYNC = 'sync', - metadata, last time ran query, etc
	STORAGE = 'storage', - don't use
}

sync_mutationEvent - outbox
modelMetadata - last time we synced a model