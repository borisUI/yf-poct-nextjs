import { marked } from "marked"; // Or use react-markdown
import ReactMarkdown from "react-markdown";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

// This is the key function for SSG
// It tells Next.js which pages to build
export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.STRAPI_API_URL}/api/pages?fields[0]=slug`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    },
  );

  const pages = await res.json();

  // We must return an array of objects like [{ slug: 'about' }, { slug: 'contact' }]
  return pages.data.map((page: any) => ({
    slug: page.slug,
  }));
}

// Helper function to fetch data for a single page
async function getPageData(slug: string) {
  const res = await fetch(
    `${process.env.STRAPI_API_URL}/api/pages?filters[slug][$eq]=${slug}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      // This ensures we're doing SSG
      cache: "force-cache",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.data[0]; // Get the first (and only) page
}

// The Page component itself
export default async function Page({ params }: { params: { slug: string } }) {
  const ppp = await params;

  const page = await getPageData(ppp.slug);

  if (!page) {
    return <div>Page not found.</div>;
  }

  const { Title, Content } = page;

  return (
    <article>
      <h1>{Title}</h1>

      <BlocksRenderer content={Content} />
    </article>
  );
}
