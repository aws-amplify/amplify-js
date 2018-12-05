export default class Composer { 
  superclass: any; 
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...classes) { 
    return classes.reduce((c, mixin) => mixin(c), this.superclass);
  }
}
