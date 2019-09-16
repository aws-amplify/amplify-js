import { css } from 'emotion';

export const forgotPasswordLink = css`
  font-family: var(--font-family);
  font-weight: lighter;
  font-size: 14px;
  margin-bottom: 	2.625rem;

  a:link {
    color: var(--amazon-orange);
    text-decoration: none;
  }

  a:hover {
    color: var(--light-amazon-orange);
    text-decoration: underline;
  }
  
  a:active {
    color: var(--button-click);
    text-decoration: underline;
  }
`;

export const signInFormFooter = css`
  font-family: var(--font-family);
  font-weight: lighter;
  font-size: 14px;
  margin-bottom: 10px;

  a:link {
    color: var(--amazon-orange);
    text-decoration: none;
  }

  a:hover {
    color: var(--light-amazon-orange);
    text-decoration: underline;
  }
  
  a:active {
    color: var(--button-click);
    text-decoration: underline;
  }

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;
