import { E2EPage, newE2EPage } from '@stencil/core/testing';

describe('amplify-scene e2e:', () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
    console.log(page);
  });

  it('renders', async () => {
    expect(true).toEqual(true);
  });
});
