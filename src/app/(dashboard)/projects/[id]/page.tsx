import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ProjectPageContent } from './project-page-content';

// Server Component : résout les params async (Next.js 15+ / React 19)
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProjectPageContent id={id} />
    </Suspense>
  );
}
