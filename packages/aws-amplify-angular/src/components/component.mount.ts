import { Type } from '@angular/core';

export class ComponentMount {
  constructor(public component: Type<any>, public data: any) {}
}
