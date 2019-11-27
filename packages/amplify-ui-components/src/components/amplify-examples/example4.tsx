import { h } from '@stencil/core';

const colStyle = {
  float: 'left',
  marginRight: '30px',
};

const mfaOptions = {
  SMS: true,
  TOTP: true,
  Optional: true,
};

const Example4 = () => (
  <div>
    <div style={colStyle}>
      Player 1
      <rock-paper-scissor />
    </div>
    <div style={colStyle}>
      Player 2
      <rock-paper-scissor icon={({ label }) => label} />
    </div>
    <div>
      <amplify-totp MFATypes={mfaOptions}></amplify-totp>
    </div>
  </div>
);

export default {
  title: 'Rock Paper Scissor game',
  Content: Example4,
};
