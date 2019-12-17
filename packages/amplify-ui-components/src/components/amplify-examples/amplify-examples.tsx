import { Component, State, h } from '@stencil/core';
import { AuthenticatorExample } from './authenticator-example';
import TOTPAuthenticatorExample from './auth-totp-example';
import example4 from './example4';
import sceneExample from './scene-example';
import Auth from '@aws-amplify/auth';
import XR from '@aws-amplify/xr';
import awsexports from './src/aws-exports';

Auth.configure(awsexports);
XR.configure(awsexports);

const examples = [AuthenticatorExample, TOTPAuthenticatorExample, example4, sceneExample];

(window as any).LOG_LEVEL = 'DEBUG';

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
