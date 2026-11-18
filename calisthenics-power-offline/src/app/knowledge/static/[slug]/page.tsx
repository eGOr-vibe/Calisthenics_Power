import { STATIC_ELEMENTS } from "@/lib/data/static-elements";
import StaticDetailClient from "./page-client";

export function generateStaticParams() {
  return STATIC_ELEMENTS.map((e) => ({ slug: e.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StaticDetailClient slug={slug} />;
}
