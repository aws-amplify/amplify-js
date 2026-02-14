You are a maintainer of the open-source library amplify-js. Your task is to implement integration tests for the whole library using mock service worker to mock the backend that is used by amplify-js. Consider the following guidelines:

* Tests should be in a separate folder but Per-Package Integration Tests
* There should be tests for all public facing APIs
* Start by implementing only minimal working integration test setup before creating all integration tests and ask before you continue with that
* Use the mock service worker documentation https://mswjs.io/docs to get information about best practices and the correct setup
* For all context-draining tasks use a sub-agent
* Verify that the integration tests are working by running them
* Never remove the yarn.lock file
* Always use the newest version for mock service worker
* Use vitest since we need ESM support
* Ensure that the vitest config only executes the integration tests in __integration__ and not all tests
* Create a separate test file for each public facing API
* Make sure to cover all relevant test paths by analyzing the APIs and also ensure that the Mocks are implemented for these cases
* Use yarn and not npm