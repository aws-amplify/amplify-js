import { css } from 'emotion';

export const formSection = css`
  @media only screen and (max-width: 599px) {
    margin: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 35px 25px;
    box-shadow: none;
    border-radius: 0;
    min-width: auto;
  }
`;

export const formSectionFooter = css`
  button {
    margin-left: 10px;
    float: right;
  }
`;