import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users, Trash2, Edit3, Calendar } from "lucide-react";
import Modal from "../components/ui/Modal";
import { apiService } from "../services/api";
import type {
  BoardSummaryResponse,
  CreateBoardRequest,
  ProjectResponse,
} from "../types";
import { useNavigate } from "react-router-dom";

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<BoardSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<BoardSummaryResponse | null>(null);
  const [openDelete, setOpenDelete] = useState<BoardSummaryResponse | null>(
    null
  );

  const filtered = useMemo(
    () =>
      boards.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [boards, query]
  );

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
    await apiService.createBoard(form);
    setOpenCreate(false);
    await loadBoards();
  };

  const handleUpdate = async (
    id: number,
    form: Partial<CreateBoardRequest>
  ) => {
    await apiService.updateBoard(id, form);
    setOpenEdit(null);
    await loadBoards();
  };

  const handleDelete = async (id: number) => {
    await apiService.deleteBoard(id);
    setOpenDelete(null);
    await loadBoards();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search boards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Board
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-500">Loading boards...</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-500">No boards found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/boards/${b.id}`)}
              className="p-4 border rounded-xl bg-white hover:shadow-sm transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{b.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOpenEdit(b)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit3 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setOpenDelete(b)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                {b.description}
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {b.memberCount} members
                </span>
                <span>{b.cardCount} cards</span>
              </div>
            </div>
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
