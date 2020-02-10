import { css } from 'emotion';

export const formSectionHeader = css`
  color: var(--amplify-section-header-color);
  margin-bottom: 24px;
  font-size: var(--amplify-primary-font-size);
  font-weight: 700;
`;

export const formSectionFooter = css`
  font-family: var(--amplify-font-family);
  font-weight: 300;
  font-size: var(--amplify-secondary-font-size);
  color: var(--amplify-grey);
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: baseline;
`;
