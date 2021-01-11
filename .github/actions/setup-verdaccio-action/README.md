# Publish a NPM package in a local registry with Verdaccio

Test the integrity of a package publishing in [Verdaccio](https://verdaccio.org/).

See in action in a full example:

```
nname: Publish Pre-check

on: [push, pull_request]

jobs:
  testVerdaccio:
    name: Test Verdaccio Publish
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Publish
      uses: verdaccio/github-actions/publish@v0.1.0
      with:
        args: -d
```

This is a based in Docker GitHub Action.