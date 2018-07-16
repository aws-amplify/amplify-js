# Simplebuild-JSHint

A simple library for automating JSHint. Now with multi-core capability.

[JSHint](http://www.jshint.com/) is a static analysis ("lint") tool for JavaScript. It analyzes JavaScript source code for common mistakes. This library provides a simple interface to JSHint that's convenient to use with task automation tools such as [Grunt](http://gruntjs.com/) or [Jake](https://github.com/mde/jake).

When you're linting a lot of files, this library will run JSHint across multiple cores. JSHint is CPU-bound, so this can result in a big speed boost. It only happens when you have a lot of files to lint (35 or more at the time of this writing) because spawning worker processes is slow.


## Installation

This is a Node.js library. Install Node, then:

`npm install simplebuild-jshint` (add `--save` or `--save-dev` if you want)

Note that this library uses your existing JSHint installation. (JSHint will be installed if needed.)


## Usage

This library provides these functions:

* `checkFiles`: Run JSHint against a list of files.
* `checkOneFile`: Run JSHint against a single file (it's useful for auto-generated build dependencies).
* `checkCode`: Run JSHint against raw source code.

### `checkFiles(options, success, failure)`

Run JSHint against a list of files. A dot will be written to stdout for each file processed. Any errors will be written to stdout. When there are a large number of files to process, additional worker processes will be spawned to take advantage of additional CPU cores.

* `options`: an object containing the following properties:
    * `files`: a string or array containing the files to check. Globs (`*`) and globstars (`**`) will be expanded to match files and directory trees respectively. Prepend `!` to exclude files.
    * `options` (optional): JSHint options (see [the JSHint documentation](http://www.jshint.com/docs/options/)).
    * `globals` (optional): Permitted global variables (for use with the `undef` option). Each variable should be set to `true` or `false`. If false, the variable is considered read-only.

* `success()`: a function to call if the code validates successfully.

* `failure(message)`: a function to call if the code does not validate successfully. A simple error message is provided in the `message` parameter, but detailed error messages are written to stdout.

### `checkOneFile(options, success, failure)`

Run JSHint against a single file (it's useful for auto-generated build dependencies).

* `options`: an object containing the following properties:
    * `file`: a string containing the path to the file to check.
    * `options` (optional): JSHint options (see [the JSHint documentation](http://www.jshint.com/docs/options/)).
    * `globals` (optional): Permitted global variables (for use with the `undef` option). Each variable should be set to `true` or `false`. If false, the variable is considered read-only.

* `success()`: a function to call if the code validates successfully.

* `failure(message)`: a function to call if the code does not validate successfully. A simple error message is provided in the `message` parameter, but detailed error messages are written to stdout.

### `checkCode(options, success, failure)`

Run JSHint against raw source code. Any errors will be written to stdout.

* `options`: an object containing the following properties:
    * `code`: a string containing the source code to check.
    * `options` (optional): JSHint options (see [the JSHint documentation](http://www.jshint.com/docs/options/)).
    * `globals` (optional): Permitted global variables (for use with the `undef` option). Each variable should be set to `true` or `false`. If false, the variable is considered read-only.

* `success()` a function to call if the code validates successfully.

* `failure(message)` a function to call if the code does not validate successfully. A simple error message is provided in the `message` parameter, but detailed error messages are output to stdout.


## Examples

This library is designed to be easy to integrate with any task automation tool:

### Grunt

```javascript
var jshint = require("simplebuild-jshint");

module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: [ "*.js", "src/**/*.js", "test/**/*.js" ],
            options: {
                bitwise: true,
                curly: false,
                eqeqeq: true
                // etc
            }
        }
    });

    grunt.registerTask("lint", "Lint everything", function() {
        jshint.checkFiles(grunt.config("jshint"), this.async(), grunt.warn);
    });

    grunt.registerTask("default", [ "lint" ]);
};
```

### Jake

```javascript
var jshint = require("simplebuild-jshint");

task("default", [ "lint" ]);

task("lint", function() {
    jshint.checkFiles({
        files: [ "*.js", "src/**/*.js", "test/**/*.js" ],
        options: {
            bitwise: true,
            curly: false,
            eqeqeq: true
            // etc
        }
    }, complete, fail);
}, { async: true });
```

### Plain JavaScript

```javascript
var jshint = require("simplebuild-jshint");

jshint.checkFiles({
    files: [ "*.js", "src/**/*.js", "test/**/*.js" ],
    options: {
        bitwise: true,
        curly: false,
        eqeqeq: true
        // etc
    }
}, function() {
    console.log("OK");
}, function(message) {
    console.log(message);
});
```

## About Simplebuild

This library is a simplebuild module. In addition to being used as a standalone library (as described above), it can also be used with simplebuild extensions and mappers. For more information about simplebuild, see [the Simplebuild GitHub page](https://github.com/jamesshore/simplebuild).


## Version History

__1.3.0:__ `checkFiles()` uses multiple cores when a lot of files need linting. This can result in a big speed boost.

__1.2.0:__ `checkFiles()` reads files asynchronously and in parallel, which makes it a bit faster.

__1.1.0:__ Better error messages when `options` parameter is incorrect.  

__1.0.1:__ Fix: doesn't try to report non-existent error codes (they're not present in old versions of JSHint).

__1.0.0:__ Reports warning codes (and error codes) so they can be disabled more easily.

__0.3.1:__ Fix: crashed when error objects had no evidence (first seen in JSHint 2.8.0).

__0.3.0:__ Added `jshint` as a peer dependency. It no longer needs to be installed separately.

__0.2.0:__ `checkOneFile()`.

__0.1.1:__ Corrected documentation error: options.globals is not actually a JSHint option.

__0.1.0:__ `checkSource()` and `checkFiles()`.


## Contributors

Created by James Shore.

### Release Process

1. Update version history in readme and check in
2. Ensure clean build: `./jake.sh`
3. Remove temporary branches: `git branch`, `git branch -d [branch]`
4. Update npm version: `npm version [major|minor|patch]`
5. Release to npm: `npm publish`
6. Release to github: `git push && git push --tags`


## License

The MIT License (MIT)

Copyright (c) 2012-2015 James Shore

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

