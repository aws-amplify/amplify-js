// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const globby = require('globby');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');

// See: https://stackoverflow.com/a/18650828
function formatBytes(bytes, decimals = 0) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

describe('@amplify/ui-components bundle size', () => {
  beforeAll(() => {
    spawnSync('yarn', ['build'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
  });

  it('should match snapshot', async () => {
    const stats = await globby('**', { cwd: dist, stats: true });
    const sizes = stats.reduce((acc, stat) => {
      acc[stat.path] = formatBytes(stat.size);
      return acc;
    }, {});

    expect(sizes).toMatchSnapshot();
  });
});
