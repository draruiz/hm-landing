export const websiteSchema = (url: string, name: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  url,
  name,
  potentialAction: {
    "@type": "SearchAction",
    target: `${url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const localBusinessSchema = ({
  name,
  description,
  url,
  image,
  telephone,
  address,
}: {
  name: string;
  description: string;
  url: string;
  image: string;
  telephone: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postal: string;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${url}/#business`,
  name,
  description,
  url,
  image,
  telephone,
  address: {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    addressRegion: address.region,
    addressCountry: address.country,
    postalCode: address.postal,
  },
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function absoluteUrl(path: string, site: string): string {
  return new URL(path, site).href;
}

export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trimEnd() + "...";
}
