# Conflict Resolution
- **AppSync is the source of truth for conflict resolution**
   1. In the event AppSync fails to resolve a conflict, the network response will contain an error message (`conflict unhandled`). This is how we give customers the chance to make an update, or try again.
   2. We use jittered retry (10x).
- We err on the side of not deleting customer data when performing conflict resolution.
- Auto-merge is the default resolution strategy. This relies on the version, and will attempt to merge fields that changed when possible.