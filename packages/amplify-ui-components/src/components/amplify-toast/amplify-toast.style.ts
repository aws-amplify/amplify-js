import { css } from 'emotion';

export const toast = css`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.3);
  padding: 16px;
  background-color: var(--light-squid-ink);
  font-size: var(--secondary-font-size);
  color: var(--white);
  box-sizing: border-box;

  > span {
    margin-right: 10px;
  }
`;

export const toastClose = css`
  margin-left: auto;
  align-self: center;
  position: relative;
  width: 18px;
  height: 18px;
  overflow: hidden;
  cursor: pointer;

  ::before,
  ::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 100%;
    top: 50%;
    left: 0;
    margin-top: -1px;
    background: var(--light-grey);
  }

  :hover::before,
  :hover::after {
    background: var(--red);
  }

  ::before {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  ::after {
    -webkit-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
`;
