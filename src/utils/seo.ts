export const websiteSchema = (url: string, name: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${url}/#website`,
  url,
  name,
  inLanguage: "en-US",
  publisher: { "@id": `${url}/#clinic` },
});

/**
 * The practice itself. MedicalClinic is a LocalBusiness subtype, so Google
 * reads it for local results while also understanding it is a health provider.
 * Practice-wide facts (hours, languages, area served) live here so every page
 * that emits this schema stays consistent.
 */
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
  "@type": "MedicalClinic",
  "@id": `${url}/#clinic`,
  name,
  description,
  url,
  image,
  logo: `${url}/images/logo.png`,
  telephone,
  email: "info@healthymindspecialists.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    addressRegion: address.region,
    addressCountry: address.country,
    postalCode: address.postal,
  },
  hasMap: `https://maps.google.com/?q=${encodeURIComponent(
    `${address.street}, ${address.city}, ${address.region} ${address.postal}`,
  )}`,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "21:00",
    },
  ],
  medicalSpecialty: "Psychiatric",
  availableLanguage: ["English", "Spanish"],
  paymentAccepted: "Cash, Check, Credit Card, Insurance",
  areaServed: [
    { "@type": "City", name: "Riverview, FL" },
    { "@type": "City", name: "Brandon, FL" },
    { "@type": "City", name: "Tampa, FL" },
    { "@type": "State", name: "Florida" },
  ],
  sameAs: ["https://www.instagram.com/healthymindspecialists"],
});

/**
 * A clinician profile. `displayName` is the on-page form ("Dr. Maria A. Ruiz,
 * PsyD"); it is split into name, honorific prefix and credential suffix.
 */
export const personSchema = ({
  displayName,
  jobTitle,
  url,
  image,
  siteUrl,
}: {
  displayName: string;
  jobTitle: string;
  url: string;
  image?: string;
  siteUrl: string;
}) => {
  const [rawName, ...suffix] = displayName.split(", ");
  const prefixMatch = rawName.match(/^(Dr\.)\s+/);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: prefixMatch ? rawName.slice(prefixMatch[0].length) : rawName,
    ...(prefixMatch && { honorificPrefix: prefixMatch[1] }),
    ...(suffix.length > 0 && { honorificSuffix: suffix.join(", ") }),
    jobTitle,
    url,
    ...(image && { image }),
    worksFor: {
      "@type": "MedicalClinic",
      "@id": `${siteUrl}/#clinic`,
      name: "Healthy Mind Specialists",
      url: siteUrl,
    },
  };
};

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

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

export const articleSchema = ({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  publisherName: string;
  publisherLogo: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author: { "@type": "Person", name: authorName },
  publisher: {
    "@type": "Organization",
    name: publisherName,
    logo: { "@type": "ImageObject", url: publisherLogo },
  },
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
