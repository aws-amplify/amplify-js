import { css } from 'emotion';

const deepSquidInk = '#152939';
const lightSquidInk = '#31465F';
const white = '#FFFFFF';
const red = '#DD3F5B';
const lightBlue = '#00a1c9';

export const loadingOverlay = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${lightSquidInk};
  min-height: 400px;
`;

export const loadingContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const loadingLogo = css`
  margin-bottom: 20px;
  width: 80px;
  fill: ${white};
`;

export const loadingSceneName = css`
  color: ${white};
  margin: 0 2px 20px 2px;
  font-size: 1em;
  font-family: 'Amazon Ember';
`;

export const loadingBar = css`
  height: 2px;
  width: 100%;
  border-radius: 2px;
  background-color: ${deepSquidInk};
`;

export const loadingBarFill = css`
  background-color: ${lightBlue};
  height: 100%;
  border-radius: 2px;
`;

export const sceneErrorText = css`
  color: ${red};
  font-size: 14px;
  font-family: 'Amazon Ember';
`;
