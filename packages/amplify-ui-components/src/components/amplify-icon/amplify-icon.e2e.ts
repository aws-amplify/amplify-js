import { newE2EPage } from '@stencil/core/testing';

async function matchIcon(iconName: string) {
  const page = await newE2EPage();

  await page.setContent(
    `<amplify-icon name='${iconName}'></amplify-icon>`,
  );
  const screenshot = await page.compareScreenshot('Amplify icon', {fullPage: true});
  expect(screenshot).toMatchScreenshot({ allowableMismatchedPixels: 10 });

  const iconElement = await page.find('amplify-icon');
  expect(iconElement).not.toBeNull();
}

describe('amplify-icon', () => {
  it('renders with a sound-mute icon', async () => matchIcon('sound-mute'));
  it('renders with a sound icon', async () => matchIcon('sound'));
  it('renders with a maxmimize icon', async () => matchIcon('maxmimize'));
  it('renders with a minimize icon', async () => matchIcon('minimize'));
  it('renders with a enter-vr icon', async () => matchIcon('enter-vr'));
  it('renders with a exit-vr icon', async () => matchIcon('exit-vr'));
});