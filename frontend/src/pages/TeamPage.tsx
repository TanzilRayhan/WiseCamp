import React, { useCallback, useEffect, useState } from "react";
import { Search, UserPlus, Trash2, Shield } from "lucide-react";
import { apiService } from "../services/api";
import type { User, Project, ProjectResponse } from "../types";
import Modal from "../components/ui/Modal";

const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ps = await apiService.getProjects();
      setProjects(ps);
      if (ps.length && !selectedProjectId) setSelectedProjectId(ps[0].id);
      // If a project is selected, fetch its members via getProject (requires Project type)
      if ((selectedProjectId || (ps[0]?.id as number | undefined)) != null) {
        const pid = (selectedProjectId as number) || ps[0].id;
        // We don't have a dedicated getProjectMembers; using getProject if available
        // Fallback: getUsers (will show all) if backend doesn't return members
        try {
          const proj = (await apiService.getProject(pid)) as unknown as Project;
          if (proj?.members) {
            setUsers(proj.members as unknown as User[]);
          } else {
            const us = await apiService.getUsers();
            setUsers(us);
          }
        } catch {
          const us = await apiService.getUsers();
          setUsers(us);
        }
      } 
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter((u) =>
    [u.name, u.email, u.username].some((v) =>
      v?.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search team..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value ? Number(e.target.value) : "")
            }
            className="px-3 py-2 rounded-lg border border-gray-200"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setInviteOpen(true)}
            disabled={!selectedProjectId}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" /> Invite
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-500">Loading team...</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl border bg-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">
                    @{u.username} • {u.email}
                  </div>
                  <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" /> {u.role.replace("_", " ")}
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                  Message
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite to Project"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              disabled={!inviteEmail.trim() || !selectedProjectId || inviting}
              onClick={async () => {
                if (!selectedProjectId) return;
                setInviting(true);
                try {
                  await apiService.addProjectMember(
                    selectedProjectId as number,
                    inviteEmail.trim()
                  );
                  setInviteOpen(false);
                  setInviteEmail("");
                  await load();
                } finally {
                  setInviting(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {inviting ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamPage;
