# Contributing

## Formatting
- We use Prettier to format our code. We recommend installing it within your IDE to prevent formatting code within other Amplify packages (as opposed to formatting from the Prettier CLI directly). Example [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)).

## Testing DataStore changes locally
- On first build:
	- Within **amplify-js**: `yarn && yarn build && yarn link-all && yarn build:esm:watch`
	- Within sample app: `yarn && yarn link aws-amplify && yarn link @aws-amplify/datastore && yarn start`
- On subsequent builds (useful if something isn't working):
	- Within **amplify-js**: `yarn clean && yarn build && yarn link-all && yarn build:esm:watch`
	- Within sample app: `rm -rf node_modules && yarn && yarn link aws-amplify && yarn link @aws-amplify/datastore && yarn start`

## Contributing to these docs
- Do not link to specific lines of code, as these frequently change. Instead, do the opposite: link to the documentation within the code itself, as the docs are less likely to change.
- Prefer small, self-contained sections over large, monolothic documents.
- Do not use permalinks - instead, link to the most current files.