import 'dotenv/config';

import fse from 'fs-extra';
import path from 'path';

import client from '../lib/contentful.js';
import nunjucks from '../lib/nunjucks.js';

async function clean() {
  return fse.remove('dist');
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

async function buildPage(template, dest, data = {}) {
  const outputPath = path.normalize(dest);

  return new Promise((resolve) => {
    nunjucks.render(template, data, (err, res) => {
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

  return Promise.all([
    buildPage('404.njk', 'dist/404.html'),
    buildPage('blog.njk', 'dist/blog/index.html', data),

    // Contentful pages
    ...data.pages.map((page) => (
      buildPage('page.njk', `dist/${page.fields.url}/index.html`, page.fields)
    )),
  ]);
}

async function copyStatic() {
  return fse.copy('src/static', 'dist');
}

async function build() {
  await clean();
  await buildPages();
  await copyStatic();
}

build();
