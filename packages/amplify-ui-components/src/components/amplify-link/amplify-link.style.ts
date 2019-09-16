import { css } from 'emotion';

export const link = css`
  color: #ff9900;
  cursor: pointer;
  :link {
    color: var(--amazon-orange);
    text-decoration: none;
  }

  :hover {
    color: var(--light-amazon-orange);
    text-decoration: underline;
  }
  
  :active {
    color: var(--button-click);
    text-decoration: underline;
  }
`;
