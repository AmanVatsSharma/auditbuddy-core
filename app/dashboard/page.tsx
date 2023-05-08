import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/server/auth/auth-options';
import { AuditList } from '@/components/AuditList';
import { DashboardHeader } from '@/components/DashboardHeader';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <AuditList />
    </div>
  );
} 