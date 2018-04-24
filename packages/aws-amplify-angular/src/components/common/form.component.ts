import { Component, Input } from '@angular/core';

const template = `
<div class="amplify-form">
  <div class="form-header">
    <div class="form-title">{{ title }}</div>
  </div>
  <div class="form-body">
    <ng-content select="[form-body]"></ng-content>
  </div>
  <div class="form-footer">
    <ng-content select="[form-footer]"></ng-content>
  </div>
</div>
`

@Component({
  selector: 'amplify-form',
  template: template
})
export class FormComponent {
  @Input()
  set title(title: string) {
    this.title = title;
  }
}
