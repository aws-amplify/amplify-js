# What happens when a user changes their schema?
   - The `schema.js` file that exists within an Amplify project (located at `src/models/schema.js`) contains a version hash. 
   - This hash is compared against the hash stored in the `Settings` table of the local database. Example:
       ```
       	{
            id: "01FYABF3DMBZZJ46W1CC214NH2"
            key: "schemaVersion"
            value: "\"4401034582a70c60713e1f7f9da3b752\""
         }
       ```
   - The process of checking the schema version (`checkSchemaVersion`) occurs when DataStore starts, after the Storage Engine has been initialized, and before the Sync Engine is initialized.
   - If the schema version has changed, we clear the local storage.