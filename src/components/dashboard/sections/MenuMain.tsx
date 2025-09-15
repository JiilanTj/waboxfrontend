'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, BarChart3, Settings, Smartphone, UserCheck } from 'lucide-react';

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

export function MenuMain() {
	return (
		<div className="mb-8">
			<h3 className="text-xl font-semibold text-gray-900 mb-4">Menu Utama</h3>
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
	);
}
