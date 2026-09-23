This is an **internal-only** package to make sure all the Amplify JS library public interfaces are always compatible
with TypeScript 4.5 compiler.

If any additional public APIs are added to the library, you must make sure the new API is included in the `publicPaths.ts`
file.
