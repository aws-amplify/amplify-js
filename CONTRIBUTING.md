# Bugs

Bug reports and feature suggestions are welcome. When filing a bug, try to include as much information as you can. Details like these are incredibly useful:

- A reproducible test case or series of steps
- The date/commit of the code you're running
- Any modifications you've made relevant to the bug
- Anything unusual about your environment or deployment

# Pull Requests

Pull requests are welcome!

You should open an issue to discuss your pull request, unless it's a trivial change. It's best to ensure that your proposed change would be accepted so that you don't waste your own time. If you would like to implement support for a significant feature that is not yet available, please talk to us beforehand to avoid any duplication of effort.

Pull requests should generally be opened against **master**.

Only include **_src_** files in your PR. Don't include any build files i.e. dist/ or lib/. These will be built upon publish to npm and when a release is created on GitHub.

Make sure you have attached a commit message before submitting the PR with the format: `fix/feat(package_name): message`
For example:

- A change is made in one of the file from @aws-amplify/auth
- When you want to commit the change: git commit -m 'fix(@aws-amplify/auth): the_message'
- Replace fix with feat when this is a feature change

## Tests

Please ensure that your change still passes unit tests, and ideally integration/UI tests. It's OK if you're still working on tests at the time that you submit, but be prepared to be asked about them. Wherever possible, pull requests should contain tests as appropriate. Bugfixes should contain tests that exercise the corrected behavior (i.e., the test should fail without the bugfix and pass with it), and new features should be accompanied by tests exercising the feature.

## Code Style

Generally, match the style of the surrounding code. We ship a TSLint configuration for TypeScript code. Please ensure your changes don't wildly deviate from those rules. You can run `npm run lint` to identify and automatically fix most style issues.

## Licensing

AWS Amplify is [Apache 2.0](LICENSE)-licensed. Contributions you submit will be released under that license.

We may ask you to sign a [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) for larger changes.
