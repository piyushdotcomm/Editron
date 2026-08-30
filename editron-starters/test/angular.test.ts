import { test, type TestContext } from '@webcontainer/test';
import { beforeEach, expect, onTestFinished } from 'vitest';

beforeEach<TestContext>(async ({ setup, webcontainer }) => {
  await setup(async () => {
    await webcontainer.mount('angular');
    await webcontainer.runCommand('npm', ['install']);
  });
});

test('user can build project', async ({ webcontainer }) => {
  await webcontainer.writeFile('public/manifest.webmanifest', '{}');
  await webcontainer.writeFile('src/assets/logo.txt', 'Angular asset');

  await webcontainer.runCommand('npm', ['run', 'build']);

  await expect(webcontainer.readdir('dist')).resolves.toMatchInlineSnapshot(`
    [
      "demo",
    ]
  `);

  await expect(webcontainer.readdir('dist/demo')).resolves
    .toMatchInlineSnapshot(`
    [
      "3rdpartylicenses.txt",
      "browser",
      "prerendered-routes.json",
    ]
  `);

  await expect(webcontainer.readdir('dist/demo/browser')).resolves
    .toMatchInlineSnapshot(`
        [
          "assets",
          "index.html",
          "main.js",
          "manifest.webmanifest",
          "polyfills.js",
          "styles.css",
        ]
      `);

  await expect(
    webcontainer.readFile('dist/demo/browser/manifest.webmanifest')
  ).resolves.toBe('{}');
  await expect(
    webcontainer.readFile('dist/demo/browser/assets/logo.txt')
  ).resolves.toBe('Angular asset');
});

test('starter config includes default asset mappings', async ({
  webcontainer,
}) => {
  const angularJson = JSON.parse(await webcontainer.readFile('angular.json'));

  expect(
    angularJson.projects.demo.architect.build.options.assets
  ).toStrictEqual([
    {
      glob: '**/*',
      input: 'public',
    },
    'src/assets',
  ]);
});

test('user can start project and see changes in preview', async ({
  preview,
  webcontainer,
}) => {
  const { exit } = webcontainer.runCommand('npm', ['run', 'dev']);
  onTestFinished(exit);

  await preview.getByRole('heading', { level: 1, name: 'Hello from Angular!' });

  const app = await webcontainer.readFile('src/main.ts');

  await webcontainer.writeFile(
    'src/main.ts',
    app.replace('Hello from {{ name }}!', 'File edited')
  );

  await preview.getByRole('heading', { level: 1, name: 'File edited' });
});
