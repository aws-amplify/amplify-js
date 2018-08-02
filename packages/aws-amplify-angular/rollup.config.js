import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import { uglify } from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/aws-amplify-angular.umd.js',
  format: 'umd',
  moduleName: 'ng.aws-amplify-angular',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subscription': 'Rx',
    'rxjs/ReplaySubject': 'Rx',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/add/observable/fromEvent': 'Rx.Observable',
    'rxjs/add/observable/of': 'Rx.Observable'
  },
  external: ['aws-sdk' ,'@angular/core', 'aws-amplify'],
  plugins: [
    nodeResolve({ preferBuiltins: false, modulesOnly: true }), 
    commonjs({include: 'node_modules/**'}),
    globals(),
    builtins(),
    json(),
    uglify(),
    analyze({limit: 5})
  ]

}