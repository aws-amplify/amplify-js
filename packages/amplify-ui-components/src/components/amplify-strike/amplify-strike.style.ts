import { css } from 'emotion';

export const strike = css`
  display: block;
  width: 100%;
  text-align: center;
  border-bottom: 1px solid var(--light-grey);
  line-height: 0.1em;
  margin: 32px 0;
  color: var(--grey);
`;

export const strikeContent = css`
  background: var(--form-color);
  padding: 0 25px;
  font-size: 14px;
  font-weight: 500;
`;
