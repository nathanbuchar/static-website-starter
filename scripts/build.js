import 'dotenv/config';

import fse from 'fs-extra';
import path from 'path';

import client from '../lib/contentful.js';
import nunjucks from '../lib/nunjucks.js';

function clean() {
  return fse.remove('dist');
}

function copyStatic() {
  return fse.copy('src/static', 'dist');
}

async function getEntries(contentType) {
  const data = await client.getEntries({
    content_type: contentType,
  });

  return data.items;
}

async function getData() {
  const [pages] = await Promise.all([
    getEntries('page'),
    // ...
  ]);

  return {
    pages,
  };
}

function buildPage(template, dest, ctx = {}) {
  const outputPath = path.normalize(dest);

  return new Promise((resolve) => {
    nunjucks.render(template, ctx, (err, res) => {
      if (err) throw err;

      fse.outputFile(outputPath, res, () => {
        console.log(`Wrote "${outputPath}"`);
        resolve();
      });
    });
  });
}

async function buildPages() {
  const data = await getData();

  // Template globals.
  nunjucks.addGlobal('pages', data.pages);

  // Build pages.
  return Promise.all([
    buildPage('404.njk', 'dist/404.html'),
    buildPage('blog.njk', 'dist/blog/index.html'),

    // Contentful pages
    ...data.pages.map((page) => {
      const ctx = page.fields;
      const outputPath = `dist/${ctx.url}/index.html`;

      return buildPage('page.njk', outputPath, ctx);
    }),
  ]);
}

async function build() {
  await clean();
  await buildPages();
  await copyStatic();
}

build();
