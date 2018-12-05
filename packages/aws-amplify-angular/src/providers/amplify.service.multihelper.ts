export default class MixinBuilder { 
  superclass: any; 
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) { 
    const q = mixins.reduce((c, mixin) => new mixin(c), this.superclass);
    return q;
  }
}
