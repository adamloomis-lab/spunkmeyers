import { BUSINESS, LINKS } from "./constants";
import { menuData } from "@/data/menu";
import { visitQuestions } from "@/data/visit-questions";
import { SITE_NAME, SITE_URL, type PageMetadata } from "./page-metadata";

export const restaurantSchema = {
  "@type": ["Restaurant", "BarOrPub"],
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS.name,
  alternateName: ["Spunkmeyers", "Spunks"],
  description:
    "Restaurant and pub in Wadsworth, Ohio, serving smash burgers, wings and American pub food, with 18 beers on tap, the Buck Naked Bar outdoor patio, Cleveland sports and a seasonal Christmas pop-up.",
  url: `${SITE_URL}/`,
  telephone: "+1-330-334-5080",
  image: [
    "/img/storefront.jpg",
    "/img/wings.jpg",
    "/img/patio-colorful.jpg",
    "/img/bar-interior.jpg",
  ].map(p => SITE_URL + p),
  logo: `${SITE_URL}/img/logo.webp`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "993 High St",
    addressLocality: "Wadsworth",
    addressRegion: "OH",
    postalCode: "44281",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.0498303,
    longitude: -81.7276839,
  },
  hasMap: LINKS.googleReview,
  openingHoursSpecification: BUSINESS.hours.map(({ day, opens, closes }) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${day}`,
    opens,
    closes,
  })),
  priceRange: "$$",
  servesCuisine: ["American", "Pub Food"],
  hasMenu: { "@id": `${SITE_URL}/menu#menu` },
  menu: `${SITE_URL}/menu`,
  sameAs: [
    LINKS.facebook,
    LINKS.instagram,
    LINKS.googleReview,
    LINKS.yelp,
    LINKS.tripadvisor,
    LINKS.beerList,
  ],
  amenityFeature: [
    "Outdoor Seating",
    "Full Bar",
    "Live Entertainment",
    "Sports Viewing",
    "DoorDash Delivery",
  ].map(name => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
};

export const menuSchema = {
  "@type": "Menu",
  "@id": `${SITE_URL}/menu#menu`,
  name: `${SITE_NAME} Menu`,
  url: `${SITE_URL}/menu`,
  inLanguage: "en-US",
  hasMenuSection: menuData.map(category => ({
    "@type": "MenuSection",
    name: category.label,
    ...(category.note ? { description: category.note } : {}),
    hasMenuItem: category.items.map(item => ({
      "@type": "MenuItem",
      name: item.name,
      ...(item.desc ? { description: item.desc } : {}),
      ...(/^\$\d+(?:\.\d{1,2})?$/.test(item.price)
        ? {
            offers: {
              "@type": "Offer",
              price: item.price.slice(1),
              priceCurrency: "USD",
            },
          }
        : {}),
    })),
  })),
};

export function pageSchema(path: string, metadata: PageMetadata) {
  if (metadata.noindex) return undefined;
  const url = SITE_URL + path;
  const webPage: Record<string, unknown> = {
    "@type":
      path === "/contact"
        ? ["ContactPage", "FAQPage"]
        : path === "/experience"
          ? "AboutPage"
          : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: metadata.title,
    description: metadata.description,
    inLanguage: "en-US",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#business` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: SITE_URL + metadata.image,
      width: 1200,
      height: 630,
      caption: metadata.imageAlt,
    },
  };
  if (path === "/") webPage.mainEntity = { "@id": `${SITE_URL}/#business` };
  if (path === "/menu") webPage.mainEntity = { "@id": `${SITE_URL}/menu#menu` };
  if (path === "/contact")
    webPage.mainEntity = visitQuestions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    }));
  const graph: Record<string, unknown>[] = [
    restaurantSchema,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: "Spunkmeyers",
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
    webPage,
  ];
  if (path !== "/")
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        { "@type": "ListItem", position: 2, name: metadata.label, item: url },
      ],
    });
  if (path === "/menu") graph.push(menuSchema);
  return { "@context": "https://schema.org", "@graph": graph };
}
