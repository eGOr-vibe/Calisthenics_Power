import { EXERCISES } from "@/lib/data/exercises";
import ExerciseDetailClient from "./page-client";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ExerciseDetailClient slug={slug} />;
}
