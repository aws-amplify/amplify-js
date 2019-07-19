import { css, cx } from 'emotion';

export const textInput = cx('amplify-ui-text-input', css`
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 14px;
  color: var(--input-color);
  background-color: var(--input-background-color);
  background-image: none;
  border: 1px solid var(--input-border-color);
  border-radius: 3px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-bottom: 10px;
`);
