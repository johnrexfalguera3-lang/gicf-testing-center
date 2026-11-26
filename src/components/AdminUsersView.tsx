import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserRole } from '../config/sidebarTabs';

export type CohortStage = 'new_hire' | 'deployed_prod' | 'regular_employee';

export interface ManagedProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  assigned_account: string;
  assigned_lob: 'voice' | 'chat' | 'email';
  cohort_stage: CohortStage;
}

const ROLES: UserRole[] = ['agent', 'trainer', 'supervisor', 'manager', 'admin'];
const STAFF_ROLES: UserRole[] = ['trainer', 'supervisor', 'manager', 'admin'];
const LOBS: ('voice' | 'chat' | 'email')[] = ['voice', 'chat', 'email'];
const COHORTS: CohortStage[] = ['new_hire', 'deployed_prod', 'regular_employee'];

function isStaffRoleValue(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<ManagedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, assigned_account, assigned_lob, cohort_stage')
      .order('email', { ascending: true });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setUsers((data as ManagedProfile[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFieldChange = (
    id: string,
    field: keyof ManagedProfile,
    value: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        if (field === 'role') {
          const nextRole = value as UserRole;
          return {
            ...u,
            role: nextRole,
            cohort_stage: isStaffRoleValue(nextRole)
              ? 'regular_employee'
              : u.cohort_stage,
          };
        }
        return { ...u, [field]: value };
      })
    );
  };

  const handleSaveUser = async (user: ManagedProfile) => {
    setSavingId(user.id);
    setStatusMessage(null);
    setErrorMessage(null);

    const nextCohortStage: CohortStage = isStaffRoleValue(user.role)
      ? 'regular_employee'
      : user.cohort_stage;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: user.full_name,
        role: user.role,
        assigned_account: user.assigned_account.trim().toUpperCase(),
        assigned_lob: user.assigned_lob,
        cohort_stage: nextCohortStage,
      })
      .eq('id', user.id);

    if (error) {
      setErrorMessage(`Could not update ${user.email}: ${error.message}`);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, cohort_stage: nextCohortStage } : u
        )
      );
      setStatusMessage(`Saved changes for ${user.email}.`);
    }
    setSavingId(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      u.assigned_account.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin User Management</h1>
          <p className="text-sm text-slate-600">
            View and update user roles, assigned accounts, LOBs, and cohort stages.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="glass-btn px-4 py-2 text-sm font-medium cursor-pointer"
        >
          Refresh List
        </button>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or account..."
          className="rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {statusMessage && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {errorMessage}
        </div>
      )}

      <div className="glass-card overflow-x-auto p-4">
        {loading ? (
          <p className="text-sm text-slate-600">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-slate-600">No matching users found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Account</th>
                <th className="py-2 pr-3">LOB</th>
                <th className="py-2 pr-3">Cohort</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isStaff = isStaffRoleValue(u.role);
                return (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium text-slate-900">{u.email}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={u.full_name ?? ''}
                        onChange={(e) => handleFieldChange(u.id, 'full_name', e.target.value)}
                        className="w-36 rounded border border-slate-300 bg-white px-2 py-1 text-slate-900"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleFieldChange(u.id, 'role', e.target.value)}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-900"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={u.assigned_account}
                        onChange={(e) =>
                          handleFieldChange(u.id, 'assigned_account', e.target.value)
                        }
                        className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-slate-900"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={u.assigned_lob}
                        onChange={(e) =>
                          handleFieldChange(u.id, 'assigned_lob', e.target.value)
                        }
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-900"
                      >
                        {LOBS.map((lob) => (
                          <option key={lob} value={lob}>
                            {lob}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      {isStaff ? (
                        <span className="text-xs font-medium text-slate-500">
                          Regular Employee
                        </span>
                      ) : (
                        <select
                          value={u.cohort_stage}
                          onChange={(e) =>
                            handleFieldChange(u.id, 'cohort_stage', e.target.value)
                          }
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-900"
                        >
                          {COHORTS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        disabled={savingId === u.id}
                        onClick={() => handleSaveUser(u)}
                        className="glass-btn px-3 py-1 text-xs font-semibold cursor-pointer"
                      >
                        {savingId === u.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};