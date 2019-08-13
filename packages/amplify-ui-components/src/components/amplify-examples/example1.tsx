import { h } from '@stencil/core';

const handleSampleFormSubmit = event => {
  event.preventDefault();
  event.stopPropagation();
  console.log('sample form submit', event);
};

const Example1 = () => (
  <div>
    <amplify-checkbox name="hey" value="hey" label="hey" fieldId="hey"></amplify-checkbox>
    <amplify-radio-button label="woooo"></amplify-radio-button>
    <form onSubmit={handleSampleFormSubmit}>
      <fieldset>
        <legend>Sample form</legend>
        <p>
          <amplify-text-field fieldId="sample-text-field" label="Sample text field" description="Insert a string" />
        </p>
        <p>
          <amplify-text-field
            fieldId="sample-number-field"
            label="Sample number field"
            description="Select a number"
            inputProps={{
              type: 'number',
            }}
          />
        </p>
      </fieldset>
      <amplify-select></amplify-select>
      <amplify-button type="submit">Submit</amplify-button>
      <amplify-link>Reset</amplify-link>
    </form>
  </div>
);

export default {
  title: 'Sample form',
  Content: Example1,
};
