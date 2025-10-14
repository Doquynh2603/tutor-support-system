/**
 * File: pages/HomePage.tsx
 * Mục đích: Trang chủ của application
 * Vai trò:
 *   - Hiển thị danh sách users
 *   - Demo sử dụng React Query hook (useUsers)
 * Lưu ý:
 *   - useUsers hook cần được implement trong hooks/useUsers.ts
 *   - Cần có error và loading states
 *   - Tailwind CSS classes dùng cho styling
 */

import { useUsers } from '@/hooks/useUsers';

export default function HomePage() {
  const { data: users, isLoading, error } = useUsers();

  // Loading state
  if (isLoading) return <div className="p-8">Loading...</div>;

  // Error state
  if (error) return <div className="p-8">Error loading users</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Tutor Support System</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>

        {users && users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded p-4">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </div>
    </div>
  );
}