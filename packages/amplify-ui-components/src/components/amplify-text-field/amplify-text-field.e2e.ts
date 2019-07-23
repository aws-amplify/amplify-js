import { newE2EPage } from '@stencil/core/testing';

describe('amplify-text-field', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent(
      `<amplify-text-field field-id="id" label="Label test" description="Description test"></amplify-text-field>`,
    );
    const textElement = await page.find('amplify-text-field');
    expect(textElement).not.toBeNull();

    const labelElement = await page.find('label');
    expect(labelElement).toEqualText('Label test');
    expect(labelElement).toEqualAttribute('for', 'id');

    const descriptionElement = await page.find('.description');
    expect(descriptionElement).toEqualText('Description test');
  });

  it('renders no label or description if none are provided', async () => {
    const page = await newE2EPage();

    await page.setContent(`<amplify-text-field></amplify-text-field>`);

    const labelElement = await page.find('label');
    expect(labelElement).toBeNull();

    const descriptionElement = await page.find('.description');
    expect(descriptionElement).toBeNull();
  });

  it('fires an onInput event when the contents of the box are changed', async () => {
    const page = await newE2EPage();

    await page.setContent(`<amplify-text-field></amplify-text-field>`);

    const func = jest.fn();
    await page.exposeFunction('exposedfunc', func);
    await page.$eval('amplify-text-field', (textElement: any) => {
      textElement.inputProps.onInput = this.exposedfunc;
      textElement.label = 'adding a label so that the component rerenders';
    });
    await page.waitForChanges();

    const input = await page.find('input');
    await input.press('8');
    expect(func).toBeCalledTimes(1);
    expect(func.mock.calls[0][0].isTrusted).toBe(true);
    const value = await input.getProperty('value');
    expect(value).toBe('8');
  });

  it('can have multiple input types', async () => {
    const page = await newE2EPage();

    await page.setContent(`<amplify-text-field></amplify-text-field>`);
    const textElement = await page.find('amplify-text-field');

    textElement.setProperty('inputProps', {
      type: 'checkbox',
    });
    await page.waitForChanges();

    const input = await page.find('input');
    expect(input).toEqualAttribute('type', 'checkbox');
  });
});
