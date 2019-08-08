import { storiesOf } from '@storybook/html';

storiesOf('amplify-select', module).add('Default', () => {
  return `<amplify-select></amplify-select>`;
});

storiesOf('amplify-select', module).add('Custom Options', () => {
  const options = [
    { label: 'Gogi', value: 1 },
    { label: 'Googiii', value: 2 },
    { label: 'Foo', value: 3 },
  ];

  return `<amplify-select options=${options}></amplify-select>`;
});
