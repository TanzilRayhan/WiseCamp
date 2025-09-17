import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  Trash2,
  Edit3,
  Settings,
  User,
} from "lucide-react";
import type { ProjectResponse, CreateProjectRequest } from "../types";

// Mock data for development
const mockProjects: ProjectResponse[] = [
  {
    id: 1,
    name: "WiseCamp Project Management",
    description:
      "A comprehensive project management tool with Kanban boards, team collaboration, and task tracking.",
    ownerId: 1,
  },
  {
    id: 2,
    name: "E-Commerce Platform",
    description:
      "Building a scalable e-commerce platform with modern technologies and microservices architecture.",
    ownerId: 1,
  },
  {
    id: 3,
    name: "Mobile App Development",
    description:
      "Cross-platform mobile application with React Native for iOS and Android platforms.",
    ownerId: 1,
  },
  {
    id: 4,
    name: "Data Analytics Dashboard",
    description:
      "Real-time analytics dashboard for business intelligence and data visualization.",
    ownerId: 1,
  },
  {
    id: 5,
    name: "Social Media Integration",
    description:
      "Social media management tool with automated posting and analytics features.",
    ownerId: 1,
  },
];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "owned" | "member">("all");

  useEffect(() => {
    // Simulate loading with mock data
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 800);
  }, []);

  const handleCreateProject = async (data: CreateProjectRequest) => {
    try {
      // Mock project creation
      const newProject: ProjectResponse = {
        id: Date.now(), // Simple ID generation
        name: data.name,
        description: data.description,
        ownerId: 1,
      };
      setProjects((prev) => [...prev, newProject]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleUpdateProject = async (data: CreateProjectRequest) => {
    if (!selectedProject) return;
    try {
      // Mock project update
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, name: data.name, description: data.description }
            : p
        )
      );
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      // Mock project deletion
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    // Note: We'd need user ID to filter by ownership - for now show all
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and collaborate with your team
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "owned" | "member")
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Projects</option>
            <option value="owned">Owned by me</option>
            <option value="member">I'm a member</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first project."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(project) => {
                setSelectedProject(project);
                setShowEditModal(true);
              }}
              onDelete={(project) => {
                setSelectedProject(project);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <ProjectModal
          title="Create New Project"
          onSubmit={handleCreateProject}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <ProjectModal
          title="Edit Project"
          initialData={{
            name: selectedProject.name,
            description: selectedProject.description,
          }}
          onSubmit={handleUpdateProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <DeleteConfirmModal
          projectName={selectedProject.name}
          onConfirm={handleDeleteProject}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: ProjectResponse;
  onEdit: (project: ProjectResponse) => void;
  onDelete: (project: ProjectResponse) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {project.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {project.description}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Project
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Project Settings
              </button>
              <button
                onClick={() => {
                  onDelete(project);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>0 members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>0 boards</span>
          </div>
        </div>
        <span className="text-xs">Created recently</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Owner: <span className="font-medium">Project Owner</span>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
};

interface ProjectModalProps {
  title: string;
  initialData?: CreateProjectRequest;
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project description"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  projectName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Delete Project
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{projectName}"? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
