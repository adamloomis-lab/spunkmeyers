import { Helmet } from "react-helmet-async";
import { useChristmasSeason } from "@/lib/holiday";
import { getPageMetadata, SITE_NAME, SITE_URL } from "@/lib/page-metadata";
import { pageSchema } from "@/lib/structured-data";

/** One metadata definition drives the initial HTML and client-side navigation. */
export default function SEO({ path }: { path: string }) {
  const christmas = useChristmasSeason();
  const page = getPageMetadata(path, christmas);
  const url = SITE_URL + path;
  const image = SITE_URL + page.image;
  const jsonLd = pageSchema(path, page);
  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta
        name="robots"
        content={
          page.noindex
            ? "noindex, follow"
            : "index, follow, max-image-preview:large"
        }
      />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta
        property="og:image:type"
        content={page.image.endsWith(".png") ? "image/png" : "image/jpeg"}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={page.imageAlt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={page.imageAlt} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      )}
    </Helmet>
  );
}
