export function documentContent(text, file) {
  text = text.replace(/^[\u200B-\u200F\uFEFF]+/u, '');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  const body = frontmatter ? text.slice(frontmatter[0].length) : text;
  const heading = /^#[\t ]+(.+?)(?:[\t ]+#+)?[\t ]*$/m.exec(body)?.[1];
  const field = (key) =>
    frontmatter?.[1]
      .match(new RegExp(`^${key}:[\\t ]*(.+?)[\\t ]*$`, 'm'))?.[1]
      .replace(/^(['"])(.*)\1$/, '$2');
  const title = (
    heading ||
    field('title') ||
    field('name') ||
    file.split('/').pop().replace(/\.md$/i, '')
  )
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>|[*`]/g, '')
    .trim();
  return { title, body };
}
