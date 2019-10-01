import { Component, State, h } from '@stencil/core';
import example1 from './example1';
import example2 from './example2';
import example3 from './example3';
import example4 from './example4';
import example5 from './example5';

import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
// import Amplify from 'aws-amplify';
import aws_exports from './src/aws-exports';

Auth.configure(aws_exports);
XR.configure(aws_exports);
// Amplify.configure(aws_exports);

const examples = [example1, example2, example3, example4, example5];

const Tabs = ({ active, set }) => (
  <ul>
    {examples.map(({ title }, index) => (
      <li class={active === index ? 'active' : ''}>
        <a onClick={() => set(index)} href="javascript:void(0);">
          {title}
        </a>
      </li>
    ))}
  </ul>
);

@Component({
  tag: 'amplify-examples',
})
export class AmplifyExamples {
  @State() tabIndex: number = 0;

  setTab = index => {
    this.tabIndex = index;
  };

  render() {
    const { Content, title } = examples[this.tabIndex];
    return (
      <div>
        <h1>AWS Amplify UI - Examples</h1>
        <Tabs active={this.tabIndex} set={this.setTab} />
        <hr />
        <h2>{title}</h2>
        <Content />
      </div>
    );
  }
}
