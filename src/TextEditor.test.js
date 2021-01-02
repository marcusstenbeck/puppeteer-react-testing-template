import 'pptr-testing-library/extend';
import puppeteer from 'puppeteer';
import { createRenderTag } from './puppeteer-react-utils';

describe('TextEditor', () => {
  let browser;
  let render;

  beforeAll(async () => {
    // TODO: remove this?
    // it's here so I have time to inspect the browser on errors
    const OPEN = false;
    if (OPEN) {
      const ONE_SECOND = 1000;
      jest.setTimeout(10 * ONE_SECOND);
    }

    browser = await puppeteer.launch({
      headless: !OPEN,
      slowMo: OPEN ? 10 : undefined,
      devtools: OPEN,
    });

    render = createRenderTag({
      browser,
      importString: "import TextEditor from './TextEditor';",
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('can type in the editor', async () => {
    const page = await render`<TextEditor />`;

    const $document = await page.getDocument();

    const $editor = await $document.getByTestId('text-editor');

    // type something
    await $editor.type('hello everyone');

    await $editor.getByText('hello everyone');
  });

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
});
