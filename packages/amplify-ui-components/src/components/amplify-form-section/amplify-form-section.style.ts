import { css } from 'emotion';

export const formSectionHeader = css`
  color: var(--section-header-color);
  margin-bottom: 24px;
  font-size: var(--primary-font-size);
  font-weight: 700;
`;

export const formSectionFooter = css`
  font-family: var(--font-family);
  font-weight: 300;
  font-size: var(--secondary-font-size);
  color: var(--grey);
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: baseline;
`;
