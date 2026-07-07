/*
 * SEO Component - Spunkmeyers Pub & Grill
 * Handles per-page meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 */
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

const SITE_URL = "https://spunkmeyers.pub";
const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/SPUNKS-1920w_9cbccce4.webp";

export default function SEO({ title, description, path, ogImage, ogType = "website", jsonLd, noindex }: SEOProps) {
  const fullUrl = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Spunkmeyers Pub & Grill" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="US-OH" />
      <meta name="geo.placename" content="Wadsworth" />
      <meta name="geo.position" content="41.0498303;-81.7276839" />
      <meta name="ICBM" content="41.0498303, -81.7276839" />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// LocalBusiness schema for Spunkmeyers Pub & Grill
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  "@id": "https://spunkmeyers.pub/#business",
  name: "Spunkmeyers Pub & Grill",
  alternateName: "Spunkmeyers",
  description: "Wadsworth's favorite pub featuring 18 beers on tap, smash burgers, wings, the Buck Naked outdoor bar, and Ohio sports on every screen. Official Browns Backer Bar.",
  url: "https://spunkmeyers.pub",
  telephone: "+1-330-334-5080",
  email: "",
  image: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/SPUNKS-1920w_9cbccce4.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/488745002_1173083834716231_4189979829948856344_n_e8e7f678.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/489455792_1173083864716228_1455366668806752534_n_7eab823c.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/505866671_1225941609430453_2401601335831511267_n_b7359eac.jpg"
  ],
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/SPUNKS-1920w_9cbccce4.webp",
  address: {
    "@type": "PostalAddress",
    streetAddress: "993 High St",
    addressLocality: "Wadsworth",
    addressRegion: "OH",
    postalCode: "44281",
    addressCountry: "US"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.0498303,
    longitude: -81.7276839
  },
  hasMap: "https://www.google.com/maps/place/Spunkmeyers+Pub+%26+Grill/@41.0498303,-81.7276839,17z",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "11:00",
      closes: "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Monday",
      opens: "16:00",
      closes: "00:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Tuesday",
      opens: "16:00",
      closes: "00:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "11:00",
      closes: "00:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Thursday",
      opens: "11:00",
      closes: "02:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "11:00",
      closes: "02:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "11:00",
      closes: "02:00"
    }
  ],
  priceRange: "$$",
  servesCuisine: ["American", "Pub Food", "Bar Food"],
  acceptsReservations: false,
  menu: "https://spunkmeyers.pub/menu",
  paymentAccepted: "Cash, Credit Card, Debit Card",
  currenciesAccepted: "USD",
  areaServed: {
    "@type": "City",
    name: "Wadsworth",
    containedInPlace: {
      "@type": "State",
      name: "Ohio"
    }
  },
  sameAs: [
    "https://www.facebook.com/SpunkmeyersPub/",
    "https://www.instagram.com/spunkmeyerspubandgrill/",
    "https://www.doordash.com/store/spunkmeyers-pub-&-grill-wadsworth-32307611/49163347/"
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "200",
    bestRating: "5",
    worstRating: "1"
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Outdoor Seating", value: true },
    { "@type": "LocationFeatureSpecification", name: "Full Bar", value: true },
    { "@type": "LocationFeatureSpecification", name: "Live Entertainment", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sports Viewing", value: true },
    { "@type": "LocationFeatureSpecification", name: "DoorDash Delivery", value: true }
  ]
};

// Restaurant menu schema
export const menuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": "https://spunkmeyers.pub/menu#menu",
  name: "Spunkmeyers Pub & Grill Menu",
  description: "Full food and drink menu featuring smash burgers, wings, loaded fries, pierogies, wraps, salads, and 18 beers on tap.",
  url: "https://spunkmeyers.pub/menu",
  mainEntityOfPage: "https://spunkmeyers.pub/menu",
  inLanguage: "en-US",
  hasMenuSection: [
    {
      "@type": "MenuSection",
      name: "Summer Menu",
      description: "Limited-time summer shareables, salads, sandwiches, and entrees"
    },
    {
      "@type": "MenuSection",
      name: "Starters",
      description: "Appetizers and shareables"
    },
    {
      "@type": "MenuSection",
      name: "Smash Burgers",
      description: "Fresh smash burgers cooked to order on brioche buns"
    },
    {
      "@type": "MenuSection",
      name: "Wings",
      description: "Bone-in and boneless wings with signature sauces"
    },
    {
      "@type": "MenuSection",
      name: "Sandwiches & Wraps",
      description: "Handhelds and wraps"
    },
    {
      "@type": "MenuSection",
      name: "Salads & Bowls",
      description: "Fresh salads and grain bowls"
    },
    {
      "@type": "MenuSection",
      name: "Sides",
      description: "Side dishes and extras"
    }
  ]
};

// BreadcrumbList schema generator
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}
