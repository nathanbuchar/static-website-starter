import nunjucks from 'nunjucks';

import markdown from './markdown.js';

const env = nunjucks.configure('src');

env.addFilter('markdown', (str) => {
  return markdown.render(str);
});

env.addFilter('selectByField', (items, field) => {
  return items.filter((item) => {
    return Boolean(item.fields[field]);
  });
});

export default env;
