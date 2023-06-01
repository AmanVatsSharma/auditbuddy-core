import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/server/auth/auth-options';
import { prisma } from '@/server/db';
import { AuditResults } from '@/components/AuditResults';
import { PremiumUpgrade } from '@/components/PremiumUpgrade';

export default async function AuditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const audit = await prisma.audit.findUnique({
    where: { id: params.id },
    include: { website: true },
  });

  if (!audit) {
    notFound();
  }

  const isPremiumUser = session?.user?.isPremium;
  const isOwner = session?.user?.id === audit.userId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Audit Results for {audit.website.url}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Started {new Date(audit.createdAt).toLocaleString()}
        </p>
      </div>

      <AuditResults auditId={audit.id} />

      {!isPremiumUser && isOwner && audit.status === 'COMPLETED' && (
        <div className="mt-8">
          <PremiumUpgrade auditId={audit.id} />
        </div>
      )}
    </div>
  );
} 