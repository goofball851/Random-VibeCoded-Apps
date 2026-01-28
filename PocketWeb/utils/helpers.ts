
export const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return `https://www.google.com/s2/favicons?sz=64&domain=google.com`;
  }
};

export const formatUrl = (url: string) => {
  let formatted = url.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = 'https://' + formatted;
  }
  return formatted;
};

export const generateId = () => Math.random().toString(36).substring(2, 9);
