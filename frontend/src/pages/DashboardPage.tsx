import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDrag, useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { Plus, Users, Calendar, Activity, Folder, MoreHorizontal} from "lucide-react";
import type { ProjectResponse, BoardSummaryResponse, CreateProjectRequest, CreateBoardRequest} from "../types";
import { apiService } from "../services/api";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [boards, setBoards] = useState<BoardSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openCreateBoard, setOpenCreateBoard] = useState(false);
  const [projectCreating, setProjectCreating] = useState(false);
  const [boardCreating, setBoardCreating] = useState(false);
  const { addToast } = useToast();
  const [projectForm, setProjectForm] = useState<CreateProjectRequest>({
    name: "",
    description: "",
  });
  const [boardForm, setBoardForm] = useState<CreateBoardRequest>({
    name: "",
    description: "",
    isPublic: false,
    projectId: undefined,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, b] = await Promise.all([
          apiService.getProjects(),
          apiService.getBoards(),
        ]);
        setProjects(p);
        setBoards(b);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const moveProject = (fromIndex: number, toIndex: number) => {
    setProjects((prev) => {
      if (fromIndex === toIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const moveBoard = (fromIndex: number, toIndex: number) => {
    setBoards((prev) => {
      if (fromIndex === toIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const stats = {
    totalProjects: projects.length,
    totalBoards: boards.length,
    totalMembers: boards.reduce((acc, b) => acc + (b.memberCount || 0), 0),
    totalTasks: boards.reduce((acc, b) => acc + (b.cardCount || 0), 0),
  };

  const chartData = projects.slice(0, 7).map((p) => ({
    name: p.name,
    Boards: p.boardCount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Developer!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setOpenCreateProject(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
            <button
              onClick={() => setOpenCreateBoard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Board
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Project Modal */}
      <Modal
        open={openCreateProject}
        onClose={() => setOpenCreateProject(false)}
        title="Create Project"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenCreateProject(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setProjectCreating(true);
                try {
                  await apiService.createProject(projectForm);
                  const p = await apiService.getProjects();
                  setProjects(p);
                  setOpenCreateProject(false);
                  setProjectForm({ name: "", description: "" });
                  addToast("Project created successfully!", "success");
                } catch (e: unknown) {
                  const err = e as {
                    response?: { data?: { message?: string } };
                    message?: string;
                  };
                  const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create project";
                  addToast(msg, "error");
                } finally {
                  setProjectCreating(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              disabled={!projectForm.name.trim() || projectCreating}
            >
              {projectCreating ? "Creating..." : "Create"}
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
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({ ...projectForm, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Create Board Modal */}
      <Modal
        open={openCreateBoard}
        onClose={() => setOpenCreateBoard(false)}
        title="Create Board"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenCreateBoard(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setBoardCreating(true);
                try {
                  await apiService.createBoard(boardForm);
                  const b = await apiService.getBoards();
                  setBoards(b);
                  setOpenCreateBoard(false);
                  setBoardForm({
                    name: "",
                    description: "",
                    isPublic: false,
                    projectId: undefined,
                  });
                  addToast("Board created successfully!", "success");
                } catch (e: unknown) {
                  const err = e as {
                    response?: { data?: { message?: string } };
                    message?: string;
                  };
                  const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create board";
                  addToast(msg, "error");
                } finally {
                  setBoardCreating(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              disabled={!boardForm.name.trim() || boardCreating}
            >
              {boardCreating ? "Creating..." : "Create"}
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
              value={boardForm.name}
              onChange={(e) =>
                setBoardForm({ ...boardForm, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={boardForm.description}
              onChange={(e) =>
                setBoardForm({ ...boardForm, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={boardForm.projectId ?? ""}
              onChange={(e) =>
                setBoardForm({
                  ...boardForm,
                  projectId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={boardForm.isPublic}
              onChange={(e) =>
                setBoardForm({ ...boardForm, isPublic: e.target.checked })
              }
              className="rounded"
            />
            Public board
          </label>
        </div>
      </Modal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<Folder className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Boards"
          value={stats.totalBoards}
          icon={<Calendar className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Team Members"
          value={stats.totalMembers}
          icon={<Users className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<Activity className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Project Overview Chart */}
      {projects.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Project Overview
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="Boards" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
            <button
              onClick={() => navigate("/projects")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started.
              </p>
              <button
                onClick={() => setOpenCreateProject(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <DraggableProjectItem
                  key={project.id}
                  project={project}
                  index={index}
                  move={moveProject}
                  onEdit={async (data) => {
                    try {
                      const updated = await apiService.updateProject(
                        project.id,
                        data
                      );
                      setProjects((prev) =>
                        prev.map((p) => (p.id === updated.id ? updated : p))
                      );
                      addToast("Project updated successfully!", "success");
                    } catch (error: any) {
                      if (error.response?.status === 403) {
                        addToast(
                          "Only the project owner can edit this project.",
                          "error"
                        );
                      } else {
                        addToast("Failed to update project.", "error");
                      }
                    }
                  }}
                  onDelete={async () => {
                    try {
                      await apiService.deleteProject(project.id);
                      setProjects((prev) =>
                        prev.filter((p) => p.id !== project.id)
                      );
                      addToast("Project deleted successfully.", "success");
                    } catch (error: any) {
                      if (error.response?.status === 403) {
                        addToast(
                          "Only the project owner can delete this project.",
                          "error"
                        );
                      } else {
                        addToast("Failed to delete project.", "error");
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <RecentActivity boards={boards} />
      </div>

      {/* Recent Boards */}
      {boards.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Boards
            </h2>
            <button
              onClick={() => navigate("/boards")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, index) => (
              <DraggableBoardItem
                key={board.id}
                board={board}
                index={index}
                move={moveBoard}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{title}</p>
      </div>
    </div>
  );
};

interface ProjectItemProps {
  project: ProjectResponse;
  onMenuEdit?: () => void;
  onMenuDelete?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  onMenuEdit,
  onMenuDelete,
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors relative">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Folder className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
          <p className="text-sm text-gray-600 truncate">
            {project.description}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              {project.memberCount} members
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {project.boardCount} boards
            </div>
            <div className="text-xs text-gray-500">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setOpenMenu((v) => !v)}
        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>
      {openMenu && (
        <div className="absolute right-2 top-12 z-10 w-44 bg-white border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => {
              setOpenMenu(false);
              onMenuEdit?.();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
          >
            Edit Project
          </button>
          <button
            onClick={() => {
              setOpenMenu(false);
              onMenuDelete?.();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

interface BoardItemProps {
  board: BoardSummaryResponse;
}

const BoardItem: React.FC<BoardItemProps> = ({ board }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="h-3 w-3" />
          {board.memberCount}
        </div>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{board.name}</h4>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {board.description}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{board.cardCount} cards</span>
        <span>{new Date(board.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const RecentActivity: React.FC<{ boards: BoardSummaryResponse[] }> = ({
  boards,
}) => (
  <motion.div
    className="bg-white rounded-xl border border-gray-200 p-6"
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: 0.1 }}
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Recent Activity
    </h3>
    <div className="space-y-4">
      {boards
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((b) => (
          <div key={b.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{b.name}</span> board created
              </p>
              <p className="text-xs text-gray-500">
                {new Date(b.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      {boards.length === 0 && (
        <div className="text-sm text-gray-500">No recent activity yet.</div>
      )}
    </div>
  </motion.div>
);

type DragTypes = "PROJECT" | "BOARD";

interface DraggableProjectItemProps {
  project: ProjectResponse;
  index: number;
  move: (from: number, to: number) => void;
  onEdit?: (data: Partial<CreateProjectRequest>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const DraggableProjectItem: React.FC<DraggableProjectItemProps> = ({
  project,
  index,
  move,
  onEdit,
  onDelete,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "PROJECT" as DragTypes,
      item: { index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [index]
  );

  const [, drop] = useDrop<{ index: number; type: DragTypes }>(
    () => ({
      accept: "PROJECT",
      hover(item, monitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
        move(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    }),
    [index, move]
  );

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.6 : 1 }}>
      <ProjectItem
        project={project}
        onMenuEdit={() => setEditOpen(true)}
        onMenuDelete={() => setDeleteOpen(true)}
      />
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Project"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              disabled={saving || !name.trim()}
              onClick={async () => {
                if (!onEdit) return setEditOpen(false);
                setSaving(true);
                try {
                  await onEdit({ name, description });
                  setEditOpen(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Project"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!onDelete) return setDeleteOpen(false);
                setDeleting(true);
                try {
                  await onDelete();
                  setDeleteOpen(false);
                } finally {
                  setDeleting(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{project.name}"? This action cannot
          be undone.
        </p>
      </Modal>
    </div>
  );
};

interface DraggableBoardItemProps {
  board: BoardSummaryResponse;
  index: number;
  move: (from: number, to: number) => void;
}

const DraggableBoardItem: React.FC<DraggableBoardItemProps> = ({
  board,
  index,
  move,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "BOARD" as DragTypes,
      item: { index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [index]
  );

  const [, drop] = useDrop<{ index: number; type: DragTypes }>(
    () => ({
      accept: "BOARD",
      hover(item, monitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
        move(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    }),
    [index, move]
  );

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.6 : 1 }}>
      <BoardItem board={board} />
    </div>
  );
};

export default DashboardPage;
