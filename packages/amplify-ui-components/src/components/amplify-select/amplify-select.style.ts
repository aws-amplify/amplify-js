import { css } from 'emotion';

export const select = css`
  padding: 14px;
  font-size: 14px;
  color: var(--amplify-deep-squid-ink);
  background-color: var(--amplify-white);
  background-image: none;
  border: 1px solid var(--amplify-input-border-color);
  border-radius: 3px 0 0 3px;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  flex-basis: auto;
  width: fit-content;
  height: 51px;

  background-image: linear-gradient(45deg, transparent 50%, gray 50%),
    linear-gradient(135deg, gray 50%, transparent 50%), linear-gradient(to right, #ccc, #ccc);
  background-position: calc(100% - 20px) calc(1em + 8px), calc(100% - 15px) calc(1em + 8px), calc(100% - 2.5em) 0.5em;
  background-size: 6px 5px, 6px 5px, 0px 1.5em;
  background-repeat: no-repeat;

  :focus {
    outline: none;
    border-color: var(--amplify-amazon-orange);
  }
`;
