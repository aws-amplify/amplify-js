import { h } from '@stencil/core';

const handleSampleFormSubmit = event => {
  event.preventDefault();
  event.stopPropagation();
  console.log('sample form submit', event);
};

const optionsForSelect = [
  { value: 1, label: 'Rad'},
  { value: 2, label: 'Super'},
  { value: 3, label: 'Tad'}
];

const Example1 = () => (
  <div>
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
      <amplify-select options={optionsForSelect}></amplify-select>
      <amplify-button type="submit">Submit</amplify-button>
      <amplify-link>Reset</amplify-link>
    </form>
  </div>
);

export default {
  title: 'Sample form',
  Content: Example1,
};
