'use strict';

const currentPath = process.argv[1].slice(0,process.argv[1].lastIndexOf('/'));
const packageInfo = require(`${currentPath}/package`);
const tscES5OutDir = `/tsc-out/cjs`;
const tscES6OutDir = `/dist/esm`;

async function buildRollUp() {
    console.log(`Building Roll up bundle file under ${currentPath}`);
    const rollup = require('rollup');
    const resolve = require('rollup-plugin-node-resolve');
    const sourceMaps = require('rollup-plugin-sourcemaps');
    const json = require('rollup-plugin-json');

    const external = [
        'aws-sdk',
        'aws-sdk/global',
        'react-native'
    ];

    const input = `${currentPath}${tscES5OutDir}/src/index.js`;
    const file = `${currentPath}${packageInfo.main.slice(packageInfo.main.indexOf('/'))}`;
    const onwarn = function(warning) {
        if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }
        // console.warn everything else
        console.warn( warning.message );
    }

    const inputOptions = {
        input,
        plugins: [
            json(),
            resolve(),
            sourceMaps(),
        ],
        external,
        onwarn
    };

    const outputOptions = {
        file,
        format: 'cjs',
        name: 'index',
        sourcemap: true,
        exports: 'named'
    };

    console.log(`Using the rollup configuration:`);
    console.log(inputOptions);
    console.log(outputOptions);

    try {
        const bundle = await rollup.rollup(inputOptions);
        await bundle.write(outputOptions);
        // console.log(result);
    } catch (e) {
        console.log(e);
    }
}

const ts = require("typescript");


function tsc(fileNames, options) {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();

    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition();
        let message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            "\n"
        );
        console.log(
            `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
        );
        } else {
        console.log(
            `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
        );
        }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}



const fs = require("fs");
const path = require("path");
const fileList = [];

async function buildES5() {
    let compilerOptions = {
        "noImplicitAny": false,
        "lib": [
            "dom",
            "es2017",
            "esnext.asynciterable"
        ],
        "sourceMap": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "allowJs": false,
        "declaration": true,
        "typeRoots": [
            `${currentPath}/node_modules/@types`,
            `${__dirname.slice(0, __dirname.lastIndexOf('/'))}/node_modules/@types`
        ],
        // temporary fix
        "types": ["node"],
        "outDir": `${currentPath}${tscES5OutDir}`,
        "target": "es5"
    }
    
    
    compilerOptions = ts.convertCompilerOptionsFromJson(compilerOptions);
    const include = [`${currentPath}/src`];
    console.log(`Using the typescript compiler options:`);
    console.log(compilerOptions);

    Promise.all(include.map(function(source) {
        return iterateFiles(source);
    })).then(() => {
        console.log("Files to be transpiled by tsc:");
        console.log(fileList);
        tsc(fileList, compilerOptions.options);
    });
}

function buildES6() {

}

function build(type) {
    if (type === 'rollup') buildRollUp();
    if (type === 'es5') buildES5();
    if (type === 'es6') buildES6();
}


function iterateFiles(source) {
    // Loop through all the files in the directory
    return new Promise((res, rej) => {
        fs.readdir(source, function (err, files) {
            if (err) {
                console.error("Could not list the directory.", err);
                return rej(err);
            }

            Promise.all(
                files.map((file) => {
                    var filePath = path.join(source, file);
                    return new Promise((res, rej) => {
                        fs.stat(filePath, (error, stat) => {
                            if (error) {
                                console.error("Error stating file.", error);
                                return rej(error);
                            }

                            if (stat.isFile()) {
                                fileList.push(filePath);
                                return res();
                            } else if (stat.isDirectory()){
                                iterateFiles(filePath).then(() => {
                                    return res();
                                });
                            } else {
                                return res();
                            }
                        });
                    });
                })
            ).then(() => {
                 return res();
            }) 
        });
    });
}

module.exports = build;



       // fs.stat(fromPath, function (error, stat) {
            // if (error) {
            //     console.error("Error stating file.", error);
            //     return;
            // }

            // if (stat.isFile())
            //     console.log("'%s' is a file.", fromPath);
            // else if (stat.isDirectory())
            //     console.log("'%s' is a directory.", fromPath);

            // fs.rename(fromPath, toPath, function (error) {
            //     if (error) {
            //     console.error("File moving error.", error);
            //     } else {
            //     console.log("Moved file '%s' to '%s'.", fromPath, toPath);
            //     }
            // });
            // });