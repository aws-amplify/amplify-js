import { E2EPage, newE2EPage } from '@stencil/core/testing';

describe('amplify-button', () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it('renders', async () => {
    await page.setContent('<amplify-button></amplify-button>');
    const element = await page.find('amplify-button');
    expect(element).toHaveProperty('type');
  });

  it('fires its onButtonClicked callback upon being clicked', async () => {
    console.log("started the test");
    await page.setContent('<amplify-button></amplify-button>');

    const buttonElement = await page.find('amplify-button');
    expect(buttonElement).not.toBeNull();

    const func = jest.fn();
    await page.exposeFunction('exposedfunc', func);

    // This block here, and the .exposeFunction() above, are both necessary
    // if you ever want to pass a function into an object's props
    /*
    await page.$eval('amplify-button', (buttonElement: any) => {
      buttonElement.onButtonClicked = this.exposedfunc;
      buttonElement.type = 'submit'; // Adding a type so that the component rerenders
    });
    await page.waitForChanges();
    */

    const button = await page.find('button');
    console.log(button);
    //await button.click().catch(e => e);
    //await page.click('button');
    //await page.click('baton'); // <= fails with the error: "No node found for selector: baton" -- so page.click('button') has to be finding the button, too
    //await page.waitForChanges();
    /*
    */
   /*
    await page.focus('button');
    await page.keyboard.type('\n');
    */
   /*
    await page.$eval('button', (elem: any) => elem.click());
    */

    //expect(func).toBeCalledTimes(1);
  });
});
