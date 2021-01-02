import browserify from 'browserify';
import { Readable } from 'stream';

export const createRenderTag = ({ browser, importString }) => {
  const parseLiteral = (strings, ...expressions) => {
    let src = '';
    let exposedFunctions = [];

    for (let i = 0; i < strings.length; i++) {
      src += strings[i];

      const expression = expressions[i];
      if (!expression) continue;

      // expose on window if it's a function
      if (typeof expression === 'function') {
        const exposedFunctionName = `__expression${i}_function`;
        exposedFunctions.push([exposedFunctionName, expression]);
        src += `window.${exposedFunctionName}`;
      } else {
        src += String(expression);
      }
    }

    return { src, exposedFunctions };
  };

  async function render(...args) {
    const { src, exposedFunctions } = parseLiteral(...args);

    const page = await browser.newPage();

    for (const [name, fn] of exposedFunctions) {
      await page.exposeFunction(name, fn);
    }

    const scriptSrc = `import React from 'react';
        import ReactDOM from 'react-dom';
        ${importString}
    
        const rootEl = document.createElement('div');
        document.body.appendChild(rootEl);
        ReactDOM.render(${src}, rootEl);
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

    return page;
  }

  return render;
};
