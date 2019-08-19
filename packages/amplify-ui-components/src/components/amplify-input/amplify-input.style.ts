import { css } from 'emotion';

export const input = css`
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 14px;
  color: #152939;
  background-color: #fff;
  background-image: none;
  border: 1px solid #c4c4c4;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 10px;

  :focus {
    outline: none;
    border-color: orange;
  }
`;