import { PROBLEM_AREAS } from "@/lib/data/problem-areas";
import ProblemDetailClient from "./page-client";

export function generateStaticParams() {
  return PROBLEM_AREAS.map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProblemDetailClient slug={slug} />;
}
