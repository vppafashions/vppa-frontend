import { useEffect } from 'react';

interface DocumentHeadOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

function setMetaTag(attribute: string, value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useDocumentHead(options: DocumentHeadOptions) {
  useEffect(() => {
    const prevTitle = document.title;

    if (options.title) {
      document.title = options.title;
    }
    if (options.description) {
      setMetaTag('name', 'description', options.description);
    }
    if (options.canonical) {
      setCanonical(options.canonical);
    }

    // Open Graph
    if (options.ogTitle || options.title) {
      setMetaTag('property', 'og:title', options.ogTitle || options.title || '');
    }
    if (options.ogDescription || options.description) {
      setMetaTag('property', 'og:description', options.ogDescription || options.description || '');
    }
    if (options.ogImage) {
      setMetaTag('property', 'og:image', options.ogImage);
    }
    if (options.ogType) {
      setMetaTag('property', 'og:type', options.ogType);
    }
    if (options.canonical) {
      setMetaTag('property', 'og:url', options.canonical);
    }

    // Twitter Card
    if (options.twitterTitle || options.title) {
      setMetaTag('name', 'twitter:title', options.twitterTitle || options.title || '');
    }
    if (options.twitterDescription || options.description) {
      setMetaTag('name', 'twitter:description', options.twitterDescription || options.description || '');
    }
    if (options.twitterImage || options.ogImage) {
      setMetaTag('name', 'twitter:image', options.twitterImage || options.ogImage || '');
    }

    return () => {
      document.title = prevTitle;
    };
  }, [
    options.title,
    options.description,
    options.canonical,
    options.ogTitle,
    options.ogDescription,
    options.ogImage,
    options.ogType,
    options.twitterTitle,
    options.twitterDescription,
    options.twitterImage,
  ]);
}
