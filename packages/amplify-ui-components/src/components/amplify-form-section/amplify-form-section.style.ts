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

export const formSectionHeader = css`
  color: var(--section-header-color);
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 500;
`;

export const formSectionFooter = css`
  font-size: 14px;
  color: var(--grey);
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
`;