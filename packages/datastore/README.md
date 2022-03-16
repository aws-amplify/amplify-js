# AWS Amplify DataStore Docs

**TODO: figure out relative links that change w/ code changes**

[Amplify DataStore](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/) provides a programming model for leveraging shared and distributed data without writing additional code for offline and online scenarios, which makes working with distributed, cross-user data just as simple as working with local-only data.

| package                | version                                                         |
| ---------------------- | --------------------------------------------------------------- |
| @aws-amplify/datastore | ![npm](https://img.shields.io/npm/v/@aws-amplify/datastore.svg) |

Before you start reading through these docs, take a moment to understand [how DataStore works at a high level](https://docs.amplify.aws/lib/datastore/how-it-works/q/platform/js/). Additionally, we recommend first reading through [the DataStore docs](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/). The purpose of these docs is to dive deep into the codebase itself and understand the inner workings of DataStore for the purpose of contributing. Understanding these docs is **not** necessary for using DataStore.

## Docs

- [Conflict Resolution](docs/conflict-resolution.md)
- [Contributing](docs/contributing.md)
- [DataStore Lifecycle Events ("Start", "Stop", "Clear")](docs/datastore-lifecycle-events.md)
  - This explains how DataStore fundementally works, and is a great place to start.
- [Getting Started](docs/getting-started.md) (Running against sample app, etc.)
- [Known Issues](docs/known-issues.md)
- [How DataStore uses Observables](docs/observables.md)
- [Schema Migration](docs/schema-migration.md)
- [Storage](docs/storage.md)
- [Sync Engine](docs/sync-engine.md)
- [Troubleshooting](docs/troubleshooting.md)
- [How DataStore uses PubSub](docs/pubsub.md)

## Other Resources:

- [High-level overview of how DataStore works](https://docs.amplify.aws/lib/datastore/how-it-works/q/platform/js/)
- [DataStore Docs](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/)
- [re:Invent talk](https://www.youtube.com/watch?v=KcYl6_We0EU)
