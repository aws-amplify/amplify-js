import { css } from 'emotion';

export const button = css`
  min-width: 153px;
  display: inline-block;
  margin-bottom: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  background-image: none;
  color: var(--button-color);
  background-color: var(--button-background-color);
  border-color: #ccc;
  text-transform: uppercase;
  padding: 14px 0;
  letter-spacing: 1.1px;
  border: none;
  :active {
    opacity: 1;
    background-color: #e88b01;
  }
  :hover {
    opacity: 0.8;
  }
  :disabled {
    opacity: 1;
    cursor: auto;
    background-color: #ffc46d;
  }
`;
