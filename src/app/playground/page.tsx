import React from 'react';
import { CodePlayground } from '@/components/playground/CodePlayground';

export default function PlaygroundPage({
  searchParams,
}: {
  searchParams?: { slug?: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Code &amp; SQL Playground
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-frequency data structures, algorithms, and advanced SQL window challenges tailored for Senior Software Engineers.
        </p>
      </div>

      <CodePlayground initialSlug={searchParams?.slug} />
    </div>
  );
}
