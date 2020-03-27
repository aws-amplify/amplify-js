# @aws-amplify/ui-storybook

Collection of stories & documentation for `@aws-amplify/ui-components` and related view libraries.

## Local Development

_All commands take place in the monorepo root._

1. `yarn bootstrap`
1. In another tab, `yarn lerna run build:watch --parallel --scope="@aws-amplify/ui-*" --stream`.
1. `yarn workspace @aws-amplify/ui-storybook start`
1. Check out the stories!
