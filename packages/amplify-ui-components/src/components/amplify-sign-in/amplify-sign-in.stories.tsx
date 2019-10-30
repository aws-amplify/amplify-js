import { h } from '../../common/jsx2dom';
import { knobs } from '../../common/testing';

export default {
  title: 'amplify-sign-in',
};

export const withOverrideStyle = () => <amplify-sign-in overrideStyle={knobs.overrideStyleKnob()}></amplify-sign-in>;
