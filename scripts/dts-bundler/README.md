## What is this script?

This project is used to rollup the TS types from the AWS SDK into the custom AWS clients. You can regenerate them
by running the `build` script in this project, and commit the generated file changes. Since custom AWS clients are
used in limited scope, you don't need to add any new services in most cases. Instead more often you may need to update
the SDK versions or exporting additional types.

## How does it work?



## How to update the custom AWS clients types?

To update the generated types files, you need to:

1. Update existing `*.d.ts` files in this folder. To export additional types from
  1. 
1. If new `*.d.ts` file is added, update the `dts-bundler.config.js` with additional entries.
1. Run the generating script `yarn && yarn build`. The generated files will be shown in the console.
1. Inspect generated files and make sure headers are not changed.

## Committing the changes

Committing the type changes:
The generated types bundle are suggestive, you need to make sure newly generated types are consistent with the library.
