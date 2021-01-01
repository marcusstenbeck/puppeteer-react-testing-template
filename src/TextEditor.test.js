import browserify from 'browserify';
import { Readable } from 'stream';
import puppeteer from 'puppeteer';
import 'pptr-testing-library/extend';

describe(' TextEditor', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // TODO: remove this?
    // it's here so I have time to inspect the browser on errors
    jest.setTimeout(10 * 1000);

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 10,
      devtools: true,
    });
    [page] = await browser.pages();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // TODO: be able to use this as harness for more than <TextEditor />
    const scriptSrc = `import React from 'react';
        import ReactDOM from 'react-dom';
        import TextEditor from './TextEditor';
    
        const rootEl = document.createElement('div');
        document.body.appendChild(rootEl);
        ReactDOM.render(<TextEditor />, rootEl);
        `;

    const compiledScriptSrc = await new Promise((resolve, reject) => {
      // prepare a stream containing the source for browserify
      const stream = new Readable();
      stream.push(scriptSrc); // add source content to stream
      stream.push(null); // close stream

      browserify(stream, {
        basedir: __dirname, // browserify needs to know where the "file" exists
      })
        .transform('babelify', {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        })
        .bundle((error, buffer) => {
          if (error) return reject(error);
          resolve(buffer.toString());
        });
    });

    const content = `<!DOCTYPE html>
      <html>
      <body>
        <script>${compiledScriptSrc}</script>
      </body>
      </html>`;

    await page.setContent(content);
  });

  test('can type in the editor', async () => {
    const $document = await page.getDocument();

    const $editor = await $document.getByTestId('text-editor');

    // type something
    await $editor.type('hello everyone');

    await $editor.getByText('hello everyone');
  });

  test.todo('onChange gives us the editor content');
  // it('onChange gives us the editor content', async () => {
  //   const onChange = jest.fn();
  //   const utils = render(<TextEditor onChange={onChange} />);

  //   const editorElement = await utils.getByTestId('text-editor');

  //   // focus on the editor
  //   fireEvent.click(editorElement);

  //   // type something
  //   fireEvent.blur(editorElement, {
  //     target: { textContent: 'hello everyone' },
  //   });

  //   expect(onChange).toHaveBeenCalledWith([
  //     { type: 'paragraph', children: [{ text: 'hello everyone' }] },
  //   ]);
  // });
});
