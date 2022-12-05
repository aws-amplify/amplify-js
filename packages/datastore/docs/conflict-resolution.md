# Conflict Resolution
- **AppSync is the source of truth for conflict resolution**
   1. In the event AppSync fails to resolve a conflict, the network response will contain an error message (`conflict unhandled`). This is how we give customers the chance to make an update, or try again.
   2. We use jittered retry (10x).
   - TODO: add more detail / links to how this retry logic occurs.
- We err on the side of not deleting customer data when performing conflict resolution.
- Auto-merge is the default resolution strategy. This relies on the version, and will attempt to merge fields that changed when possible.
- For more, see [the AppSync docs](https://docs.aws.amazon.com/appsync/latest/devguide/conflict-detection-and-sync.html)