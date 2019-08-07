import { css } from 'emotion';

export const select = css`
  display: flex;
  padding: 14px;
  font-size: 14px;
  color: var(--deep-squid-ink);
  background-color: #fff;
  background-image: none;
  border: 1px solid var(--light-grey);
  border-right: none;
  border-radius: 3px 0 0 3px;
  box-sizing: border-box;
  margin: 10px 0 10px 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  flex-basis: auto;
  width: 7%;
  flex: 1;

  background-image:
    linear-gradient(45deg, transparent 50%, gray 50%),
    linear-gradient(135deg, gray 50%, transparent 50%),
    linear-gradient(to right, #ccc, #ccc);
  background-position:
    calc(100% - 20px) calc(1em + 8px),
    calc(100% - 15px) calc(1em + 8px),
    calc(100% - 2.5em) 0.5em;
  background-size:
    6px 5px,
    6px 5px,
    0px 1.5em;
  background-repeat: no-repeat;
`;