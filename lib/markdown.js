import md from 'markdown-it';

const markdown = md({
  linkify: true,
  breaks: true,
  html: true,
  typographer: true,
});

export default markdown;
