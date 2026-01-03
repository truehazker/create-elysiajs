import { createFileRoute, Link } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { api } from '@/shared/api/client';

export const Route = createFileRoute('/users/')({
  component: Users,
  loader: async () => {
    const { data, error } = await api.users.get({
      query: {
        limit: 100,
        offset: 0,
      },
    });

    if (error) {
      throw new Error(error.value as string);
    }

    return { users: data?.users ?? [], total: data?.total ?? 0 };
  },
});

function Users() {
  const { users, total } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <Link
            to="/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            <UserPlus size={20} />
            Create New User
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">No users found</p>
              <p className="text-sm">Create your first user to get started.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {users.length} of {total} users
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name} {user.surname}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
