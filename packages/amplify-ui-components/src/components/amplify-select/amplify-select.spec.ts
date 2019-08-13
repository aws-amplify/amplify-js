import { newSpecPage } from '@stencil/core/testing';
import { AmplifySelect } from './amplify-select';

describe('amplify-select: ', () => {
  describe('Custom logic cases ->', () => {
    describe('Class logic ->', () => {
      let select; 

      beforeEach(() => {
        select = new AmplifySelect();
      });

      it('should have style override set to true when style-override is passed as a prop from parent', () => {
        select.styleOverride = true;
        expect(select.styleOverride).toBe(true);
      });

      it('should use custom options when passed from parent', () => {
        const options = [
          {label: 'Gogi', value: '1'},
          {label: 'Gucci', value: '2'},
          {label: 'Foooci', value: '3'}
        ];

        select.options = options;

        expect(select.options).toBeDefined();
        expect(select.options).toEqual(options);
      });

      it('should throw an error if label from options is not a string', () => {
        const options = [{ label: 1, value: 1 }];

        select.options = options;

        expect(select.options).toBeDefined();
        expect(select.splitIntoSeparateOptionsForSelect).toThrowError();
      });
    });
  });
  describe('Default cases ->', () => {
    describe('Class logic ->', () => {
      let select;

      beforeEach(() => {
        select = new AmplifySelect();
      });

      it('should have style override set to false', () => {
         expect(select.styleOverride).toBe(false);
      });
      it('should have options be defined ', () => {    
        expect(select.options).toBeDefined();
      });
    });
    describe('HTML logic ->', () => {
      it('should render with all country code dials as default', async () => {
        const page = await newSpecPage({
          components: [AmplifySelect],
          html: `<amplify-select></amplify-select>`
        });
    
        expect(page.root).toMatchSnapshot();
      });
    });
  });
});
