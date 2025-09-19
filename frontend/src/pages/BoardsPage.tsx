import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Search,
  Users,
  Trash2,
  Edit3,
  Calendar,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "../components/ui/Toast";
import Modal from "../components/ui/Modal";
import { apiService } from "../services/api";
import type {
  BoardSummaryResponse,
  CreateBoardRequest,
  ProjectResponse,
} from "../types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<BoardSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<BoardSummaryResponse | null>(null);
  const [openDelete, setOpenDelete] = useState<BoardSummaryResponse | null>(
    null
  );
  const [filter, setFilter] = useState<"all" | "owned" | "public">("all");
  const { addToast } = useToast();
  const { state: authState } = useAuth();

  const filtered = useMemo(() => {
    return boards.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(query.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "owned") {
        return b.ownerId === authState.user?.id;
      }
      if (filter === "public") {
        return b.isPublic;
      }
      return true;
    });
  }, [boards, query, filter, authState.user?.id]);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBoards();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const navigate = useNavigate();

  const handleCreate = async (form: CreateBoardRequest) => {
    try {
      await apiService.createBoard(form);
      addToast("Board created successfully!", "success");
      setOpenCreate(false);
      await loadBoards();
    } catch (error) {
      addToast("Failed to create board.", "error");
      console.error("Failed to create board", error);
    }
  };

  const handleUpdate = async (
    id: number,
    form: Partial<CreateBoardRequest>
  ) => {
    try {
      await apiService.updateBoard(id, form);
      addToast("Board updated successfully!", "success");
      setOpenEdit(null);
      await loadBoards();
    } catch (error: any) {
      if (error.response?.status === 403) {
        addToast("Only the board owner can edit this board.", "error");
      } else {
        addToast("Failed to update board.", "error");
      }
      setOpenEdit(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteBoard(id);
      addToast("Board deleted successfully.", "success");
      setOpenDelete(null);
      await loadBoards();
    } catch (error: any) {
      if (error.response?.status === 403) {
        addToast("Only the board owner can delete this board.", "error");
      } else {
        addToast("Failed to delete board.", "error");
      }
      setOpenDelete(null);
    }
  };

  return (
    <div className=" p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
          <p className="text-gray-600 mt-1">
            Organize your tasks and workflows
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Board
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search boards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "owned" | "public")
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Boards</option>
            <option value="owned">Owned by me</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-500">Loading boards...</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-500">No boards found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <BoardCard
              key={b.id}
              board={b}
              onNavigate={() => navigate(`/boards/${b.id}`)}
              onEdit={() => setOpenEdit(b)}
              onDelete={() => setOpenDelete(b)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <BoardFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(data) => handleCreate(data)}
        title="Create Board"
      />

      {/* Edit Modal */}
      {openEdit && (
        <BoardFormModal
          open={!!openEdit}
          onClose={() => setOpenEdit(null)}
          onSubmit={(data) => handleUpdate(openEdit.id, data)}
          title="Edit Board"
          initial={{
            name: openEdit.name,
            description: openEdit.description,
            isPublic: openEdit.isPublic,
          }}
        />
      )}

      {/* Delete Modal */}
      {openDelete && (
        <Modal
          open={!!openDelete}
          onClose={() => setOpenDelete(null)}
          title="Delete Board"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenDelete(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(openDelete.id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900">{openDelete.name}</span>
            ? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
};

const BoardCard: React.FC<{
  board: BoardSummaryResponse;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ board, onNavigate, onEdit, onDelete }) => {
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
  }, [menuRef]);

  return (
    <div
      onClick={onNavigate}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {board.name}
          </h3>
          <p className="text-sm text-gray-500">
            Created {new Date(board.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
        {board.description}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{board.memberCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{board.cardCount} cards</span>
          </div>
        </div>
        <div
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            board.isPublic
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {board.isPublic ? "Public" : "Private"}
        </div>
      </div>
    </div>
  );
};

const BoardFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBoardRequest) => void;
  title: string;
  initial?: Partial<CreateBoardRequest>;
}> = ({ open, onClose, onSubmit, title, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [projectId, setProjectId] = useState<number | undefined>(
    (initial?.projectId as number | undefined) ?? undefined
  );
  const [projects, setProjects] = useState<ProjectResponse[]>([]);

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setIsPublic(initial?.isPublic ?? false);
    setProjectId((initial?.projectId as number | undefined) ?? undefined);
  }, [initial, open]);

  useEffect(() => {
    const load = async () => {
      try {
        const ps = await apiService.getProjects();
        setProjects(ps);
      } catch {
        // ignore
      }
    };
    if (open) load();
  }, [open]);

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={projectId ?? ""}
            onChange={(e) =>
              setProjectId(e.target.value ? Number(e.target.value) : undefined)
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

export default BoardsPage;
