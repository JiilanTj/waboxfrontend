'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  Smartphone,
  UserCheck
} from 'lucide-react';

const stats = [
  {
    title: 'Total Akun WhatsApp',
    value: '0',
    description: 'Akun yang terhubung',
    icon: Smartphone,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Customer Service Aktif',
    value: '0',
    description: 'CS yang sedang online',
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Pesan Hari Ini',
    value: '0',
    description: 'Total pesan masuk & keluar',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Kontak Aktif',
    value: '0',
    description: 'Kontak yang berinteraksi',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const menuItems = [
  {
    title: 'Kelola Akun WhatsApp',
    description: 'Tambah, hapus, dan kelola akun WhatsApp bisnis',
    icon: Smartphone,
    href: '/accounts',
  },
  {
    title: 'Manajemen CS',
    description: 'Kelola customer service dan pembagian chat',
    icon: UserCheck,
    href: '/cs',
  },
  {
    title: 'Pesan & Chat',
    description: 'Lihat dan kelola semua percakapan',
    icon: MessageSquare,
    href: '/messages',
  },
  {
    title: 'Laporan & Analitik',
    description: 'Statistik performa dan laporan lengkap',
    icon: BarChart3,
    href: '/reports',
  },
  {
    title: 'Pengaturan',
    description: 'Konfigurasi sistem dan preferensi',
    icon: Settings,
    href: '/settings',
  },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed positioning */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content - Flex container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <MobileHeader onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 text-sm lg:text-base">
              Selamat datang di WABox Manager - Kelola semua akun WhatsApp dan customer service Anda
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                        {stat.title}
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor} flex-shrink-0 ml-3`}>
                      <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Menu Utama
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {menuItems.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-all cursor-pointer group hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                        <item.icon className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6 lg:p-8 text-center">
              <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                Fitur Lengkap Segera Hadir!
              </h4>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
                Kami sedang mengembangkan fitur-fitur lengkap untuk mengelola 
                WhatsApp multi-account dan multi-CS. Dashboard ini akan segera 
                dilengkapi dengan semua tools yang Anda butuhkan untuk mengoptimalkan 
                komunikasi bisnis Anda.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
