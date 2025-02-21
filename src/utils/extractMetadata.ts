export const extractTitle = (html: string): string => {
  // Match content between <title> tags, excluding HTML comments
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  return titleMatch ? titleMatch[1].trim() : '';
}; 