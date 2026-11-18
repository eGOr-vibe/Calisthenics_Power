import { THEORY_ARTICLES } from "@/lib/data/theory";
import TheoryArticleClient from "./page-client";

export function generateStaticParams() {
  return THEORY_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TheoryArticleClient slug={slug} />;
}
