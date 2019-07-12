import { css, cx } from 'emotion';

export const link = cx('amplify-ui-link', css`
  color: #ff9900;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`);
