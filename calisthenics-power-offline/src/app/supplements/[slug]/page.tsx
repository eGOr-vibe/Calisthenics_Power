import { SUPPLEMENTS } from "@/lib/data/supplements";
import SupplementDetailClient from "./page-client";

export function generateStaticParams() {
  return SUPPLEMENTS.map((s) => ({ slug: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SupplementDetailClient slug={slug} />;
}
