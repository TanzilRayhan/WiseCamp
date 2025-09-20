import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {Users, Calendar, Settings, Plus, UserPlus, ArrowLeft} from "lucide-react";
import { apiService } from "../services/api";
import type {ProjectDetailResponse, CreateProjectRequest, CreateBoardRequest} from "../types";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

type Tab = "boards" | "members" | "settings";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("boards");
  const { addToast } = useToast();

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiService.getProject(Number(id));
      setProject(data);
    } catch (error) {
      console.error("Failed to load project", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleUpdateProject = async (data: CreateProjectRequest) => {
    if (!project) return;
    try {
      const updated = await apiService.updateProject(project.id, data);
      setProject((p) => (p ? { ...p, ...updated } : null));
      setShowEditModal(false);
      addToast("Project updated successfully!", "success");
    } catch (error: any) {
      if (error.response?.status === 403) {
        addToast("Only the project owner can edit the project.", "error");
        setShowEditModal(false);
      } else {
        addToast("Failed to update project.", "error");
      }
      console.error("Failed to update project", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await apiService.deleteProject(project.id);
      addToast("Project deleted successfully.", "success");
      navigate("/projects");
    } catch (error: any) {
      if (error.response?.status === 403) {
        addToast("Only the project owner can delete the project.", "error");
      } else {
        addToast("Failed to delete project.", "error");
      }
      setShowDeleteModal(false);
      console.error("Failed to delete project", error);
    }
  };

  const handleAddMember = async (email: string) => {
    if (!project) return;
    await apiService.addProjectMember(project.id, email);
    await loadProject(); // Reload to get updated member list
    setShowAddMemberModal(false);
    addToast(`Invited ${email} to the project.`, "success");
  };

  const handleCreateBoard = async (data: CreateBoardRequest) => {
    if (!project) return;
    await apiService.createBoard(data);
    await loadProject(); // Reload to get updated board list
    setShowCreateBoardModal(false);
    addToast("Board created successfully!", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-gray-500 mt-2">
          The project you are looking for does not exist or you don't have
          permission to view it.
        </p>
        <Link to="/projects" className="mt-4 inline-block text-blue-600">
          ← Back to all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600  mt-1">{project.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Owner: <span className="font-medium">{project.ownerName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <TabButton
            label="Boards"
            icon={<Calendar />}
            count={project.boards.length}
            isActive={activeTab === "boards"}
            onClick={() => setActiveTab("boards")}
          />
          <TabButton
            label="Members"
            icon={<Users />}
            count={project.members.length}
            isActive={activeTab === "members"}
            onClick={() => setActiveTab("members")}
          />
          <TabButton
            label="Settings"
            icon={<Settings />}
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "boards" && (
          <BoardsTab
            project={project}
            onCreateBoard={() => setShowCreateBoardModal(true)}
          />
        )}
        {activeTab === "members" && (
          <MembersTab
            project={project}
            onAddMember={() => setShowAddMemberModal(true)}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            project={project}
            onEdit={() => setShowEditModal(true)}
            onDelete={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        title="Edit Project"
        open={showEditModal}
        onSubmit={handleUpdateProject}
        onClose={() => setShowEditModal(false)}
        initialData={project}
      />
      <DeleteConfirmModal
        open={showDeleteModal}
        projectName={project.name}
        onConfirm={handleDeleteProject}
        onClose={() => setShowDeleteModal(false)}
      />
      <AddMemberModal
        open={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
      />
      <BoardFormModal
        open={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onSubmit={handleCreateBoard}
        title="Create New Board"
        initialData={{ projectId: project.id, projectName: project.name }}
      />
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  icon: React.ReactElement;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium ${
      isActive
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {React.cloneElement(icon, { className: "h-5 w-5" })}
    {label}
    {count !== undefined && (
      <span
        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
          isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const BoardsTab: React.FC<{
  project: ProjectDetailResponse;
  onCreateBoard: () => void;
}> = ({ project, onCreateBoard }) => (
  <div>
    <div className="flex justify-end mb-4">
      <button
        onClick={onCreateBoard}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        New Board
      </button>
    </div>
    {project.boards.length === 0 ? (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No boards</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new board for this project.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.boards.map((board) => (
          <Link
            to={`/boards/${board.id}`}
            key={board.id}
            className="p-4 border rounded-xl bg-white hover:shadow-sm transition cursor-pointer"
          >
            <h4 className="font-semibold text-gray-900">{board.name}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {board.description}
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Created {new Date(board.createdAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

const MembersTab: React.FC<{
  project: ProjectDetailResponse;
  onAddMember: () => void;
}> = ({ project, onAddMember }) => (
  <div>
    <div className="flex justify-end mb-4">
      <button
        onClick={onAddMember}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <UserPlus className="h-4 w-4" />
        Add Member
      </button>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {project.members.map((member) => (
          <li
            key={member.id}
            className="px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {member.id === project.ownerId ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Owner
                </span>
              ) : (
                "Member"
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const SettingsTab: React.FC<{
  project: ProjectDetailResponse;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ project, onEdit, onDelete }) => (
  <div className="max-w-2xl space-y-8">
    {/* General Settings */}
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          General Settings
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Update your project's name and description.
        </p>
      </div>
      <div className="p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">Project Name</dt>
            <dd className="mt-1 text-gray-900">{project.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Description</dt>
            <dd className="mt-1 text-gray-600">
              {project.description || "No description provided."}
            </dd>
          </div>
        </dl>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium"
        >
          Edit Project
        </button>
      </div>
    </div>

    {/* Danger Zone */}
    <div className="bg-white border border-red-300 rounded-xl shadow-sm ">
      <div className="p-6 border-b border-red-200 ">
        <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
        <p className="text-sm text-red-600 mt-1">
          This action is permanent and cannot be undone.
        </p>
      </div>
      <div className="p-4 bg-red-50 flex justify-between items-center ">
        <p className="text-sm font-medium text-red-800">Delete this project</p>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
        >
          Delete Project
        </button>
      </div>
    </div>
  </div>
);

interface ProjectModalProps {
  title: string;
  open: boolean;
  initialData?: CreateProjectRequest;
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  title,
  open,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            disabled={isSubmitting || !formData.name.trim()}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Project"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteConfirmModalProps {
  open: boolean;
  projectName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  projectName,
  onConfirm,
  onClose,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Project"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      }
    >
      <p className="text-gray-600">
        Are you sure you want to delete "{projectName}"? This action cannot be
        undone.
      </p>
    </Modal>
  );
};

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onAddMember: (email: string) => Promise<void>;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  onClose,
  onAddMember,
}) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setIsInviting(true);
    try {
      await onAddMember(email.trim());
      setEmail("");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Member to Project"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            disabled={!email.trim() || isInviting}
            onClick={handleInvite}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {isInviting ? "Adding..." : "Add Member"}
          </button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Member Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </Modal>
  );
};

interface BoardFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBoardRequest) => void;
  title: string;
  initialData?: Partial<CreateBoardRequest> & { projectName?: string };
}

const BoardFormModal: React.FC<BoardFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [projectId, setProjectId] = useState(initialData?.projectId);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setIsPublic(initialData?.isPublic ?? false);
      setProjectId(initialData?.projectId);
    }
  }, [open, initialData]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ name, description, isPublic, projectId })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={!name.trim()}
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {initialData?.projectName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <input
              type="text"
              value={initialData.projectName}
              disabled
              className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-100"
            />
          </div>
        )}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          Public board
        </label>
      </div>
    </Modal>
  );
};

export default ProjectDetailPage;
