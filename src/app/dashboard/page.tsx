import AuthGuard from '@/components/AuthGuard';
import DashboardPageContent from '@/components/dashboard/DashboardPageContent';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <DashboardPageContent />
    </AuthGuard>
  );
}
