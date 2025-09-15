"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Smartphone } from "lucide-react";

const stats = [
	{
		title: "Total Akun WhatsApp",
		value: "0",
		description: "Akun yang terhubung",
		icon: Smartphone,
		color: "text-green-600",
		bgColor: "bg-green-100",
	},
	{
		title: "Customer Service Aktif",
		value: "0",
		description: "CS yang sedang online",
		icon: Users,
		color: "text-blue-600",
		bgColor: "bg-blue-100",
	},
	{
		title: "Pesan Hari Ini",
		value: "0",
		description: "Total pesan masuk & keluar",
		icon: MessageSquare,
		color: "text-purple-600",
		bgColor: "bg-purple-100",
	},
	{
		title: "Kontak Aktif",
		value: "0",
		description: "Kontak yang berinteraksi",
		icon: Users,
		color: "text-orange-600",
		bgColor: "bg-orange-100",
	},
];

export function StatsGrid() {
	return (
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
							<div
								className={`p-3 rounded-full ${stat.bgColor} flex-shrink-0 ml-3`}
							>
								<stat.icon
									className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
