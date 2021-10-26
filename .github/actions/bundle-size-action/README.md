# Bundle Size Action

This is a custom action that uses [`bundlewatch`](https://bundlewatch.io/) to enforce
thresholds on real-world bundle sizes.

## Running Manually

1. `cd .github/actions/bundle-size-action/${stack}`, where `stack` is a folder (e.g. `webpack`, `webpack4`, etc.)
1. `yarn install`
1. `yarn calculate`

## Adding New Tests

1.  Create a new `stack` folder under `.github/actions/bundle-size-action`
1.  In this folder, initialize your project like normal (e.g. `npm init -y`, `yarn create react-app`, etc.)
1.  Update `package.json` with a `calculate` script

    `calculate` is expected to be deterministic, performing the following steps:

    1.  Cleaning `dist`
    1.  Running `build` of the project, creating bundles
    1.  Running `bundlewatch`, which results in a `0` or `1` exit status code.

1.  Add this `stack` to the `matrix.stack` in `.github/workflows/bundle-size.yml`

## Author

- Eric Clemmons (@ericclemmons)
