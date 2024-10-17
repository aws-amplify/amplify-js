## What is this package?

Amplify JS uses custom AWS API clients in limited scope. These API handlers' types are compatible with those of
AWS SDK, and trimmed to the parameters used by the Amplify library.

This package is used to rollup the TS types from the AWS SDK into the custom AWS clients. You can regenerate them
by running the `build` script in this project, then review & commit the generated file changes.

## How to update the custom AWS clients types?

Since custom AWS clients are used in limited scope, in most cases you don't need to add any new services. Instead, you 
may need to update the SDK versions or exporting additional types. Here's the steps:

1. Make sure the `package.json` dev dependencies entry contains the AWS SDK service client you are working with and 
more importantly the version is upgraded to that supports the feature you are working with.
1. Open the `*.d.ts` file for the AWS client you need to upgrade, and make sure the interfaces you need are exported.
1. Open the `dts-bundler.config.js` file and make sure the entry to the `*.d.ts` file you are working with exists and
the `outFile` path is expected. 
    * You need to update the `libraries.inlinedLibraries` to include the AWS SDK service client package to bundle
		the TS interfaces there.
1. Run the generating script `yarn && yarn build`. The generated files will be shown in the console.
    * If you only want to work with a single AWS service instead of changing all the definitions for all the services,
		you can comment out other service entries from the `dts-bundler.config.js`.
1. Inspect the bundled TypeScript definition file in the `outFile` path. To better compare the diffs, you need to 
re-format the generated code. 
  	* You need to make sure any license headers and previous notes are not changed.
	  * The bundled TypeScript definition file may import more types transitive dependencies of AWS SDK package. In this
		case you may need to tweak the `libraries.inlinedLibraries` config until all the necessary dependency types are 
		bundled.
		    * You need to make sure the imported packages of the bundle file(e.g. `@aws-sdk/types`) are also added to the 
			  Amplify library's **runtime dependency**.
	  * You **must** make sure the documented manual changes are re-applied to the newly generated bundle file.
