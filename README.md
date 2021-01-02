# puppeteer-react-testing-template

This is a reference for setting up [Puppeteer](https://github.com/puppeteer/puppeteer) so it can (somewhat) ergonomically test React components without a local server.

```js
test('onChange gives us the editor content', async () => {
  const onChange = jest.fn();

  const page = await render`<TextEditor onChange={${onChange}} />`;

  const $document = await page.getDocument();

  const $editor = await $document.getByTestId('text-editor');

  // type something
  await $editor.type('hello everyone');

  // blur the editor
  await page.focus('body');

  expect(onChange).toHaveBeenLastCalledWith([
    { children: [{ text: 'hello everyone' }], type: 'paragraph' },
  ]);
});
```

### Why?
The original use-case is to test the [Slate](https://github.com/ianstormtaylor/slate) text editor in React. It would be nicer to avoid Puppeteer for this use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro), but that's based on JSDOM which doesn't implement `contenteditable` well enough. Writing tests for the Slate editor needs `contenteditable` to work, and that means the options are to use some full-browser solution like Puppeteer, TestCafe, Cypress, etc.

### How do you avoid a server?
It transforms and bundles a single component's source code with [browserify](http://browserify.org/) and injects everything into an empty HTML document with Puppeteer's [`page.setContent(htmlString)`](https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#pagesetcontenthtml-options).

### Why not just run a server?
It's unnecessary unless we're writing end-to-end (e2e) tests. If you're writing e2e tests then definitely run a server.
