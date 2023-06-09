This project is used to rollup the TS types from the AWS SDK into the custom AWS clients. You can regenerate them
by running the `build` script in this project, and commit the generated file changes.

To update the generated types files, you need to:

1. Update existing `*.d.ts` files in this folder or add new ones.
1. If new `*.d.ts` file is added, update the `dts-bundler.config.js` with additional entries.
1. Run the generating script `yarn && yarn build`. The generated files will be shown in the console.
1. Inspect generated files and make sure headers are not changed.
1. Commit the changes
