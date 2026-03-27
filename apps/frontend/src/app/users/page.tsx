"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionSkeleton } from "@/components/ui/feedback";
import { canAccessUsersPage, canDeleteUsers } from "@/lib/permissions";
import { UserForm } from "@/components/users/user-form";
import { UsersTable } from "@/components/users/users-table";
import { userService, type UserItem } from "@/services/user-service";
import { useAppStore } from "@/store/app-store";

export default function UsersPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  async function loadUsers() {
    if (!activeContext.companyId) {
      return;
    }

    const data = await userService.list(activeContext.companyId, activeContext.activityId ?? undefined);
    setUsers(data);
  }

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (!activeContext.companyId) {
      router.replace("/select-company");
      return;
    }

    if (!canAccessUsersPage(user, activeContext.activityId)) {
      router.replace(activeContext.activityId ? "/select-activity" : "/dashboard");
      return;
    }

    void loadUsers();
  }, [hasHydrated, accessToken, activeContext.companyId, activeContext.activityId, router, user]);

  if (!hasHydrated || !accessToken || !activeContext.companyId || !canAccessUsersPage(user, activeContext.activityId)) {
    return (
      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          <SectionSkeleton cards={2} />
        </div>
      </main>
    );
  }

  async function handleDeactivate(user: UserItem) {
    if (!activeContext.companyId) {
      return;
    }

    await userService.deactivate(user.id, activeContext.companyId);
    await loadUsers();
  }

  async function handleDelete(user: UserItem) {
    if (!activeContext.companyId) {
      return;
    }

    await userService.remove(user.id, activeContext.companyId);
    if (editingUser?.id === user.id) {
      setEditingUser(null);
    }
    await loadUsers();
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <UsersTable
          users={users}
          canDelete={canDeleteUsers(user)}
          onEdit={setEditingUser}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
        <UserForm editingUser={editingUser} onCancelEdit={() => setEditingUser(null)} onSaved={loadUsers} />
      </div>
    </main>
  );
}
