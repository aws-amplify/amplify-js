import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import angular from 'rollup-plugin-angular-aot';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import { uglify } from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

export default {
  input: 'dist/index.js',
  output: {
    name: 'aws-amplify-angular',
    file: 'dist/bundles/aws-amplify-angular.umd.js',
    format: 'umd',
    // globals: {
    //   '@ionic/angular': 'IonicModule',
      // 'aws-amplify': 'Amplify',
    //   '@angular/core': 'ng.core',
    //   '@angular/common': 'ng.common',
    //   'rxjs/Observable': 'Rx',
    //   'rxjs/Subscription': 'Rx',
    //   'rxjs/ReplaySubject': 'Rx',
    //   'rxjs/add/operator/map': 'Rx.Observable.prototype',
    //   'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    //   'rxjs/add/observable/fromEvent': 'Rx.Observable',
    //   'rxjs/add/observable/of': 'Rx.Observable'
    // },
  },
  external: [
    '@angular/core', 
    '@angular/common',   
    '@ionic/angular',
    'rxjs/Observable',
    'rxjs/Subscription',
    'rxjs/ReplaySubject',
    'rxjs/add/operator/map',
    'rxjs/add/operator/mergeMap',
    'rxjs/add/observable/fromEvent',
    'rxjs/add/observable/of'
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false, modulesOnly: true }), 
    commonjs({include: 'node_modules/**'}),
    globals(),
    builtins(),
    json(),
    uglify(),
    analyze({limit: 1})
  ]

}