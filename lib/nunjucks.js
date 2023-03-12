import nunjucks from 'nunjucks';

import markdown from './markdown.js';

const env = nunjucks.configure('src');

env.addFilter('markdown', (str) => {
  return markdown.render(str);
});

env.addFilter('selectByField', (items, field, value = true) => {
  return items.filter((item) => {
    return Boolean(item.fields[field]) === value;
  });
});

export default env;
