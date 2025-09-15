'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Edit,
  Trash2,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  limit: number;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  isUpdating: (id: number) => boolean;
  isDeleting: (id: number) => boolean;
}

export function UsersTable({ 
  users, 
  isLoading, 
  limit, 
  onEditUser, 
  onDeleteUser,
  isUpdating,
  isDeleting
}: UsersTableProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900 text-sm">Pengguna</th>
                <th className="text-left p-4 font-semibold text-gray-900 text-sm">Email</th>
                <th className="text-left p-4 font-semibold text-gray-900 text-sm">Role</th>
                <th className="text-left p-4 font-semibold text-gray-900 text-sm">Bergabung</th>
                <th className="text-center p-4 font-semibold text-gray-900 text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                        <div className="space-y-1">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2.5 rounded-full",
                          user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'
                        )}>
                          {user.role === 'ADMIN' ? 
                            <Shield className="h-4 w-4 text-purple-600" /> : 
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{user.email}</td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        user.role === 'ADMIN' 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditUser(user)}
                          disabled={isUpdating(user.id)}
                          className="h-8 w-8 hover:bg-blue-50 hover:border-blue-200"
                        >
                          {isUpdating(user.id) ? 
                            <Loader2 className="h-3 w-3 animate-spin" /> : 
                            <Edit className="h-3 w-3" />
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteUser(user)}
                          disabled={isDeleting(user.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        >
                          {isDeleting(user.id) ? 
                            <Loader2 className="h-3 w-3 animate-spin" /> : 
                            <Trash2 className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
