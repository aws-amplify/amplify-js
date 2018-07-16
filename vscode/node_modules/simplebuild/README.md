# Simplebuild - Universal Task Automation for Node.js

Tools like [Grunt](http://www.gruntjs.com) have powerful and flexible plugin ecosystems, but they only work within their walled garden. If you want to use Grunt plugins in [Jake](https://github.com/mde/jake), Jake tasks in Grunt, or write your own tool using an existing plugin... you're out of luck.

What if we had a universal approach to task automation? What if our task libraries worked with *any* tool, but our code was still idiomatic, flexible, and powerful? Imagine how useful that would be.

Simplebuild provides the solution. It's a standard way of *creating* and *plugging together* tasks that works with any tool. It's simple, but powerful; flexible, but idiomatic.

Note: Simplebuild is still in the proof-of-concept stage. Feedback welcome (be kind). Simplebuild is changing rapidly and shouldn't be used for production work yet.


## Design Goals

*Simple.* Simple to use, simple to create, and simple to extend.

*Replaceable.* No framework lock-in. You can use Simplebuild modules with any tool, and you can easily replace Simplebuild modules with something else.

*Flexible.* Works with multiple styles of automation (Grunt, Jake, promises, etc.) and allows you to compose modules to achieve interesting results.


## Examples

The following examples use Simplebuild modules to lint and test some code. Note how Simplebuild adapts to provide clean, idiomatic solutions for each tool.

(Note: these examples are slightly simplified. See [Gruntfile.js](Gruntfile.js), [Jakefile.js](Jakefile.js), or [build.js](build.js) for real code.)

### Grunt

```javascript
module.exports = function(grunt) {
  var simplebuild = require("simplebuild-ext-gruntify.js")(grunt);

  grunt.initConfig({
    JSHint: {
      files: [ "**/*.js", "!node_modules/**/*" ],
      options: { node: true },
      globals: {}
    },

    Mocha: {
      files: [ "**/_*_test.js", "!node_modules/**/*" ]
    }
  });

  simplebuild.loadNpmTasks("simplebuild-jshint");
  simplebuild.loadNpmTasks("simplebuild-mocha");

  grunt.registerTask("default", "Lint and test", ["JSHint", "Mocha"]);
};
```

### Jake

```javascript
var jakeify = require("simplebuild-ext-jakeify.js").map;

var jshint = jakeify("simplebuild-jshint.js");
var mocha = jakeify("simplebuild-mocha.js");

task("default", ["lint", "test"]);

desc("Lint everything");
jshint.validate.task("lint", {
  files: [ "**/*.js", "!node_modules/**/*" ],
  options: { node: true },
  globals: {}
});

desc("Test everything");
mocha.runTests.task("test", [], {
  files: [ "**/_*_test.js", "!node_modules/**/*" ]
});
```

### Promises

```javascript
var promisify = require("simplebuild-ext-promisify.js").map;

var jshint = promisify("simplebuild-jshint.js");
var mocha = promisify("simplebuild-mocha.js");

jshint.validate({
  files: [ "**/*.js", "!node_modules/**/*" ],
  options: { node: true },
  globals: {}
})
.then(function() {
  return mocha.runTests({
    files: [ "**/_*_test.js", "!node_modules/**/*" ]
  });
})
.then(function() {
  console.log("\n\nOK");
})
.fail(function(message) {
  console.log("\n\nFAILED: " + message);
});
```

### Running the examples

Before running the examples:

1. Install Node.js
2. Download the project code
3. Open a command prompt in the project's root directory
4. Run `npm install` to install dependencies

To run the examples:

1. Run `node build.js`, `./grunt.sh`, or `./jake.sh`. (Windows users, use `node build.js`, `node_modules\.bin\grunt`, or `node_modules\.bin\jake`.)


## Composability

Simplebuild tasks can be used in any Node.js program, so it's easy to create tasks that depend on other tasks. If there's a module that does just what you need, no worries--just `require()` it and use it!

Simplebuild also supports "mapper modules" that change the way tasks run, and "extension modules" that interface with other tools. For example, the `simplebuild-map-header` module adds a header to tasks, and the `simplebuild-ext-promisify` module converts tasks into promises. Modules can be chained together, providing flexibility and power, without requiring any special programming in the tasks.

In this example, a single addition (the second line) to the "Promises" example above adds a header to all tasks:

```javascript
var promisify = require("simplebuild-ext-promisify.js")
  .map("simplebuild-map-header.js")
  .map;

var jshint = promisify("simplebuild-jshint");
var mocha = promsifiy("simplebuild-mocha");
...
```

Output:

```
Before:                         After:

Gruntfile.js ok                 JSHint
Jakefile.js ok                  ======
build.js ok                     Gruntfile.js ok
    ⋮                           Jakefile.js ok
                                build.js ok
  ․․․․․․․․․․․․․․․․․․․               ⋮

  19 passing (44ms)             Mocha
                                =====

OK                                ․․․․․․․․․․․․․․․․․․․

                                  19 passing (44ms)


                                OK
```


## How It Works

Simplebuild's magic is based on standardized, composable function signatures and a very small supporting library. There are three kinds of Simplebuild modules:

* *Task modules* do the heavy lifting of task automation. For example, the `simplebuild-jshint` module uses JSHint to check files for errors. Task modules export functions that follow a standard format: `exports.taskFunction = function(options, successCallback, failureCallback) {...}`.

* *Mapper modules* augment task modules in some way. For example, the `simplebuild-map-header` module adds a header to each task. Mappers output task modules, so they can be added to a build script without requiring individual tasks to be changed. Multiple mapper modules may be chained together.

* *Extension modules* are like mapper modules, except that they don't have any restrictions on their input or output. They're most often used for compatibility with other coding styles or build tools. For example, `simplebuild-ext-promsify` turns Simplebuild tasks into promises, and `simplebuild-ext-gruntify` loads Simplebuild modules into Grunt.


## API

In addition to the Simplebuild spec, this npm module is also a library for use by Simplebuild module authors.

Task module authors may wish to use these functions:
 
* `normalizeOptions(userOptions, defaults, types)`: Check the `userOptions` parameter provided to a simplebuild task.
* `deglobSync(globs)`: Convert file globs into files.

Mapper and extension module authors may wish to use these functions:

* `createMapFunction(mapperFn)`: Create the `map` function required for a mapper module.
* `mapTaskModule(module, mapperFn)`: Modify every function in a module.


### `normalizeOptions(userOptions, defaults, types)`

Applies defaults to a simplebuild task's `userOptions` argument and type-checks the result.

* `userOptions`: The options passed into the task function. Must be an object.

* `defaults`: The task's default options. Any parameter that's present in `defaults` but not in `userOptions` will be included in the final options object.

* `types`: An object containing the expected types for each option. The parameters in this object correspond to the parameters in the options object. The types are checked on the final options object after the defaults are applied. Any fields that are in the final options and *not* in the `types` object will not be checked.

    * To specify a **language type**, use the corresponding object constructor: `Boolean`, `String`, `Number`, `Object`, `Array`, or `Function`. For example, if your options include a "name" parameter that's a string, you would use `name: String`.

    * To specify an **object type**, use the object constructor, such as `RegExp` or `Date`. You may also pass in the constructor for a custom subclass. For example, if your options object requires a "timestamp" parameter that's a Date object, you would use `timestamp: Date`.
  
    * To specify **specific object fields**, recursively provide another `types`-style object containing the fields you want to check. For example, if your options object requires a "report" object that contains a "verbose" boolean and a "filename" string, you would use `report: { verbose: Boolean, filename: String }`.
  
    * To specify **multiple valid types**, provide an array containing each type. For example, if your options object requires a "files" parameter that may be a string or an array, you would use `files: [ String, Array ]`.
  
    * To specify **optional, nullable, or NaN-able types**, put `undefined`, `null`, or `NaN` as one of the valid types in the array. For example, if your options object takes an optional "output" parameter that's a string, you would use `output: [ String, undefined ]`.
  
* **Returns**: The normalized options object, consisting of `userOptions` combined with `defaults`.
 
* **Throws**: If the type check fails, an `Error` object will be thrown with a human-readable explanation of the type check failure in the `message` parameter. Note that simplebuild task functions are not allowed to throw exceptions, so be sure to catch errors and return `err.message` via the `fail` callback. 
  
**Example:**

```javascript
function myTask(userOptions, succeed, fail) {
  try {
    var defaults = {
      timestamp: Date.now()
    };
    var types = {
      files: [ String, Array ],
      timestamp: Date,
      output: [ String, undefined ]
    };
    var options = simplebuild.normalizeOptions(userOptions, defaults, types);
   
    // ... task implemented here ...
  }
  catch (err) {
    return fail(err.message);
  }
}
```

### `deglobSync(globs)`

Convert file globs into files. Given an array or string, this function returns an array of filenames. Any glob (*) or globstar (**) in the `globs` parameter is converted to the actual names of files in the filesystem. If any entry in the `globs` parameter starts with an exclamation mark (!), then those files will be excluded from the result.

* `globs`: A string or array containing file globs. 

* **Returns**: An array of filename strings.


### `createMapFunction(mapperFn)`

Create the `map` function required for a mapper module. Use it like this:

```javascript
exports.map = createMapFunction(myMapper);
```

* `mapperFn(taskFn)`: A function that returns a task function, presumably by operating on `taskFn` in some way. 

* **Returns**: A `map` function satisfying the mapper module specification.


### `mapTaskModule(module, mapperFn)`

Create a new task module based on an existing task module. Similar to `createMapFunction`, except lower level.

* `module`: The task module to map.

* `mapperFn(taskFn)`: A function that returns a task function, presumably by operating on `taskFn` in some way. 

* **Returns**: The new task module.


## Contributions

Contributions, feedback, and discussions are welcome. Please use Github's issue tracker to open issues or pull requests.

**Known issues**: This is still very experimental, proof-of-concept stuff. The core `simplebuild` library is likely to see a lot of changes, the spec is likely to change and improve, and there aren't any tests yet.


## Formal Specification

**[Stability](http://nodejs.org/api/documentation.html#documentation_stability_index): 1 - Experimental**

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" in this section are to be interpreted as described in [RFC 2119](http://tools.ietf.org/html/rfc2119).

### Task Modules

Task modules export functions that follow a common format. A task module SHOULD have a name starting with "simplebuild-" but not "simplebuild-map-" or "simplebuild-ext-". (For example, "simplebuild-yourmodule.js".) All functions exported by a task module MUST be task functions.

Task functions MUST NOT be named `map()`, `sync()`, or use a name ending in `Sync()`. (These restrictions are case-sensitive.) Any other name is permitted. Each task function MUST conform to this signature:

    exports.yourFunction = function(options, succeed, fail) { ... }

`options` (REQUIRED): Configuration information. Any type of variable may be used, but an object is recommended. If a task function has no configuration, this variable is still required, but may be ignored.

`succeed()` (REQUIRED): Callback function. Each task function MUST call succeed() with no parameters when it finishes successfully.

`fail(messageString)` (REQUIRED): Callback function. Each task function MUST call fail() with a brief human-readable explanation when it fails. The explanation SHOULD be less than 50 characters.


#### Task Behavior

Task functions MUST NOT return values or throw exceptions. Instead, either the `succeed()` or `fail()` callback MUST be called exactly once when the task is complete. The callback may be called synchronously or asynchronously.

Tasks that fail SHOULD provide a detailed explanation suitable for debugging the problem. If the explanation is too long to fit in the 50-character failure mesage, the task SHOULD write the details to `process.stdout` before failing. (Note that calling `console.log()` is a convenient way of writing to `process.stdout`.)

Tasks that succeed SHOULD NOT write to `process.stdout` by default. They MAY write more if configured to do so with the `options` parameter.

Tasks that are slow or long-running MAY provide minimalistic progress output (such as periods) but SHOULD NOT provide more detailed information by default. They MAY provide more if configured to do so with the `options` parameter.

Tasks SHOULD NOT write to `process.stderr` under any circumstances.


### Mapper Modules

Mapper modules export a single function, `map()`, that transforms a Simplebuild module in some way. A mapper module SHOULD have a name starting with `simplebuild-map-`. (For example, `simplebuild-map-yourmapper.js`.)

Mapper modules MUST export only one function, named `map()`. The `map()` function call itself SHOULD NOT have any side effects, but the functions `map()` returns may. Mapper modules SHOULD use the `createMapFunction()` API call defined in the `simplebuild` module to create the `map()` function. 

The `map()` function MUST take a single parameter and return an object, as follows. These requirements are handled automatically by `createMapFunction()`.

* When the parameter is an object with a single key named `map`, it will be considered to be a mapper module. In this case, the `map()` function MUST return a mapper module. The returned module's `map()` function MUST wrap the provided mapper module so that calling `thisModule.map(providedModule).map(taskModule)` is equivalent to calling `thisModule.map(providedModule.map(taskModule))`

* When the parameter is any other object, it will be considered to be a task module. In this case, the `map()` function MUST return a task module. The returned task module SHOULD have different functions and/or behavior than the provided task module.

* When the parameter is a string, it will be considered to be an Node.js module. In this case, the `map()` function MUST use the Node.js `require()` API call to load the module, then apply the above rules.


### Extension Modules

Extension modules extend the capabilities of Simplebuild. An extension module SHOULD have a name starting with "simplebuild-ext-" (for example, "simplebuild-ext-yourextension.js").

Extension modules are unrestricted. They may export any number of functions, with any signatures, that do anything. When a function supports loading task modules by name, it SHOULD also support mapper modules as well. The `createMapFunction` API call defined in the `simplebuild` module may be helpful here.


## To Do

Things that still need work:
- When creating a module, the options and parameters need a lot of checking in `index.js`. Writing tests for this behavior is particularly tedious and repetitive. Create helper methods for this that take advantage of descriptors.
- Should messages be written to stderr instead of stdout? Or perhaps some sort of 'reporter' spec
- Pull `__test_files.js` out of simplebuild-jshint into its own module or helper
- Pull `expectsucceed()` and `expectFailure()` out of simplebuild-jshint (_index_test.js)
- The examples use an out-of-date version of the spec. In particular, they rely on descriptors, which have been removed from the spec for now.


## Version History

* 0.5.3: Bugfix: Prevent crash on Node 0.12.4 (by polyfilling Object.assign)
* 0.5.2: Bugfix: `normalizeOptions` provides better error message when option is an object literal
* 0.5.1: Bugfix: `normalizeOptions` won't crash when option is an object and expected type includes undefined or null
* 0.5.0: Added `normalizeOptions` API call
* 0.4.0: Removed descriptors for now, updated documentation
* 0.3.0: Reworked descriptors
* 0.2.0: Fleshed out spec further, made library work as proper npm module
* 0.1.0: Initial release


## Credits

Simplebuild is a project of [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com), a screencast on professional, rigorous JavaScript development. Created by James Shore.


### Release Process

1. Update version history in readme and check in
2. Ensure clean build using all examples: `./jake.sh && ./grunt.sh && node build.js`
3. Update npm version: `npm version [major|minor|patch]`
4. Release to npm: `npm publish`
5. Release to github: `git push && git push --tags`


## License

The MIT License (MIT)

Copyright (c) 2013-2015 James Shore

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

