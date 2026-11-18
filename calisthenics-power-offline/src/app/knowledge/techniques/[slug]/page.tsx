import { TECHNIQUES } from "@/lib/data/techniques";
import TechniqueDetailClient from "./page-client";

export function generateStaticParams() {
  return TECHNIQUES.map((t) => ({ slug: t.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TechniqueDetailClient slug={slug} />;
}
