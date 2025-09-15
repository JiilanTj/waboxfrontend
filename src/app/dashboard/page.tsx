import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <DashboardLayout />
    </AuthGuard>
  );
}
