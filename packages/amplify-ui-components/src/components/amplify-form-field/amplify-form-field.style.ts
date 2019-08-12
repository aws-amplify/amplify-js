import { css } from 'emotion';

export const formField = css`
  input {
    padding: 5px;
    width: 100%;
    max-width: 300px;
    box-sizing: border-box;
    border: 1px gray solid;
  }

  input:focus {
    outline: none;
    border-color: orange;
  }
`;

export const formLabel = css`
  .label {
    display: block;
    font-size: 0.9em;
    font-weight: bold;
    padding-bottom: 0.5em;
  }
`;

export const formDescription = css`
  .description {
    font-size: 0.8em;
    padding-top: 0.5em;
  }
`;
