# How DataStore uses Observables
- All of DataStore internally uses event driven methods (observables) to handle everything from the sync process, to observing online connectivity. **This makes the Storage Engine the single source of truth for DataStore.**
- Examples:
	- The Sync Engine observes DataStore Connectivity 
	- The Sync Engine observes the Storage Engine 
    - The client observes DataStore with `observe` and `observeQuery`:
		- https://docs.amplify.aws/lib/datastore/real-time/q/platform/js/

## Understanding Observables
- DataStore uses [`zen-observable`](https://github.com/zenparsing/zen-observable)
- [The RXJS docs](https://rxjs.dev/guide/observable) do a good job of describing observables in more detail.