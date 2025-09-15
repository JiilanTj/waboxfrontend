'use client';

import { WelcomeSection } from '@/components/dashboard/sections/WelcomeSection';
import { StatsGrid } from '@/components/dashboard/sections/StatsGrid';
import { MenuMain } from '@/components/dashboard/sections/MenuMain';
import { ComingSoonNotice } from '@/components/dashboard/sections/ComingSoonNotice';

export default function DashboardPageContent() {
  return (
    <>
      <WelcomeSection />
      <StatsGrid />
      <MenuMain />
      <ComingSoonNotice />
    </>
  );
}
