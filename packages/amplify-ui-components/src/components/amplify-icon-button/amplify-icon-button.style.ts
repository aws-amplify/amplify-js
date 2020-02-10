import { css } from 'emotion';

export const icon = css`
  fill: var(--amplify-white);
`;

export const actionButton = css`
  button {
    position: relative;
    padding: 0;
    background: none;
    height: 54px;
    width: 54px;
    cursor: pointer;
    outline: none;
    text-decoration: none;
    border: none;
    border-radius: 30px;
    transition: all 0.3s ease-in-out;
    color: var(--amplify-white);
    fill: currentColor;
    &:hover {
      background-color: var(--amplify-deep-squid-ink);
      box-shadow: 0.3px 0.3px 0.3px rgba(0, 0, 0, 0.3);
    }
    &:hover > .tooltip {
      display: block;
    }
    &:hover > svg {
      -webkit-filter: none;
      filter: none;
    }
    &:focus {
      outline: none;
    }

    & svg {
      width: 1.8em;
      height: 1.8em;
      -webkit-filter: drop-shadow(1px 1px 1px var(--amplify-grey));
      filter: drop-shadow(1px 1px 1px var(--amplify-grey));
    }
  }
`;

export const actionIcon = css`
  fill: var(--amplify-white);
`;
