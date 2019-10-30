/* @jsx createElement */

import { createElement, StrictMode } from 'react';
import { render } from 'react-dom';

export const h = createElement;

export const withReact = story => {
  const node = document.createElement('main');
  render(<StrictMode>{story()}</StrictMode>, node);
  return node;
};
