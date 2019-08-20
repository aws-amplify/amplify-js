import { css } from 'emotion';

export const formSection = css`
  font-family: var(--font-family);
  position: relative;
  margin-bottom: 20px;
  background-color: var(--white);
  padding: 35px 40px;
  text-align: left;
  display: inline-block;
  min-width: 460px;
  border-radius: 6px;
  box-shadow: 1px 1px 4px 0 rgba(0,0,0,0.15);
  box-sizing: border-box;

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