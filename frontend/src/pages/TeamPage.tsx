import React, { useCallback, useEffect, useState, useRef } from "react";
import { Search, UserPlus, Trash2, Shield, MoreHorizontal } from "lucide-react";
import { apiService } from "../services/api";
import type { ProjectResponse, ProjectMemberResponse } from "../types";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [projectOwnerId, setProjectOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deletingMember, setDeletingMember] =
    useState<ProjectMemberResponse | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const { state: authState } = useAuth();

  const loadMembers = useCallback(async () => {
    if (selectedProjectId === "") {
      setMembers([]);
      setProjectOwnerId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const projectDetails = await apiService.getProject(
        selectedProjectId as number
      );
      setMembers(projectDetails.members);
      setProjectOwnerId(projectDetails.ownerId);
    } catch (error) {
      console.error(
        "Failed to load members for project",
        selectedProjectId,
        error
      );
      setMembers([]);
      setProjectOwnerId(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const ps = await apiService.getProjects();
        setProjects(ps);
        if (ps.length > 0 && selectedProjectId === "") {
          setSelectedProjectId(ps[0].id);
        } else if (ps.length === 0) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []); // Run once

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filtered = members.filter((u) =>
    [u.name, u.email, u.username].some((v) =>
      v?.toLowerCase().includes(query.toLowerCase())
    )
  );

  const handleDeleteMember = async () => {
    if (!deletingMember || !selectedProjectId) return;
    try {
      await apiService.removeProjectMember(
        selectedProjectId as number,
        deletingMember.id
      );
      setDeletingMember(null);
      await loadMembers(); // Reload members
    } catch (error) {
      console.error("Failed to remove member", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-1">
          Manage project members and invitations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value ? Number(e.target.value) : "")
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-white border border-gray-200 rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filtered.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                isOwner={member.id === projectOwnerId}
                isCurrentUser={member.id === authState.user?.id}
                onRemove={() => setDeletingMember(member)}
              />
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={`Invite to ${
          projects.find((p) => p.id === selectedProjectId)?.name || "Project"
        }`}
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
                  await loadMembers();
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

      {deletingMember && (
        <DeleteMemberModal
          member={deletingMember}
          open={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          onConfirm={handleDeleteMember}
        />
      )}
    </div>
  );
};

const MemberListItem: React.FC<{
  member: ProjectMemberResponse;
  isOwner: boolean;
  isCurrentUser: boolean;
  onRemove: () => void;
}> = ({ member, isOwner, isCurrentUser, onRemove }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <li className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
          {member.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{member.name}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 capitalize">
          {isOwner ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Owner
            </span>
          ) : (
            member.role.replace("_", " ").toLowerCase()
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isOwner || isCurrentUser}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

const DeleteMemberModal: React.FC<{
  member: ProjectMemberResponse;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ member, open, onClose, onConfirm }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Remove Member"
    size="sm"
    footer={
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-red-600 text-white"
        >
          Remove
        </button>
      </div>
    }
  >
    <p>
      Are you sure you want to remove <strong>{member.name}</strong> from this
      project?
    </p>
  </Modal>
);

export default TeamPage;
