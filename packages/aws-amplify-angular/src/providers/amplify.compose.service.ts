import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify from '@aws-amplify/core';
import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';


class MixinBuilder { 
  superclass: any; 
  constructor(superclass) {
    this.superclass = superclass;
  }
  with(...mixins) { 
    const q = mixins.reduce((c, mixin) => new mixin(c), this.superclass);
    return q;
  }
}

const base = (superclass) => new MixinBuilder(superclass);

export default  (...classes) => {
   return class MyAmplify extends base(class AmplifyBase {})
  .with(...classes) {};
};



