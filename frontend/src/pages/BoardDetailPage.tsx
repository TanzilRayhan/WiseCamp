/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { apiService } from "../services/api";
import type { Board, Column, Card, CreateBoardRequest } from "../types";
import Modal from "../components/ui/Modal";
import { Plus, ArrowLeft, MoreHorizontal, Trash2, Edit2 } from "lucide-react";

const columnColors = [
  "bg-red-100/50",
  "bg-blue-100/50",
  "bg-green-100/50",
  "bg-yellow-100/50",
  "bg-purple-100/50",
  "bg-pink-100/50",
];
const columnHeaderColors = [
  "bg-red-200/60 text-red-900",
  "bg-blue-200/60 text-blue-900",
  "bg-green-200/60 text-green-900",
  "bg-yellow-200/60 text-yellow-900",
  "bg-purple-200/60 text-purple-900",
  "bg-pink-200/60 text-pink-900",
];

const BoardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [openNewCard, setOpenNewCard] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [showBoardSettingsModal, setShowBoardSettingsModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const [cardForm, setCardForm] = useState({ title: "", description: "" });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await apiService.getBoard(Number(id));
      setBoard(b);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const addCard = async (columnId: number) => {
    if (!newTitle.trim() || !board) return;
    try {
      await apiService.createCard({
        title: newTitle,
        name: newTitle,
        description: "",
        columnId,
      });
      // reload board
      await load();
      setOpenNewCard(false);
      setNewTitle("");
      setActiveColumnId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const moveCard = (cardId: number, toColumnId: number, toPosition: number) => {

    setBoard((prevBoard) => {
      if (!prevBoard) return null;

      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      let cardToMove: Card | undefined;
      let fromColumnId: number | undefined;

      // Find and remove the card from its original column
      for (const column of newBoard.columns) {
        const cardIndex = column.cards.findIndex((c: Card) => c.id === cardId);
        if (cardIndex > -1) {
          cardToMove = column.cards.splice(cardIndex, 1)[0];
          fromColumnId = column.id;
          break;
        }
      }

      if (!cardToMove) return prevBoard; 

      const toColumn = newBoard.columns.find(
        (c: Column) => c.id === toColumnId
      );
      if (!toColumn) return prevBoard; 

      toColumn.cards.splice(toPosition, 0, cardToMove);

      return newBoard;
    });

    apiService.moveCard(cardId, toColumnId, toPosition).catch((e) => {
      console.error("Failed to move card, reverting.", e);
      load(); 
    });
  };

  const handleUpdateBoard = async (data: Partial<CreateBoardRequest>) => {
    if (!board) return;
    await apiService.updateBoard(board.id, data);
    setShowBoardSettingsModal(false);
    await load();
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;
    await apiService.updateCard(editingCard.id, {
      title: cardForm.title,
      name: cardForm.title,
      description: cardForm.description,
    });
    setEditingCard(null);
    await load();
  };

  const handleDeleteCard = async () => {
    if (!deletingCard) return;
    await apiService.deleteCard(deletingCard.id);
    setDeletingCard(null);
    await load();
  };

  if (loading) return <div className="p-6">Loading board...</div>;
  if (!board) return <div className="p-6">Board not found</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <Link
              to="/boards"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to boards
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
          </div>
          <button
            onClick={() => setShowBoardSettingsModal(true)}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            Board Settings
          </button>
        </div>
        <div className="flex-grow flex gap-4 overflow-x-auto pb-2">
          {board.columns.map((col, index) => (
            <div key={col.id} className="w-80 flex-shrink-0">
              <ColumnComponent
                colorIndex={index}
                col={col}
                addCard={() => {
                  setActiveColumnId(col.id);
                  setOpenNewCard(true);
                }}
                onDropCard={(cardId, pos) => moveCard(cardId, col.id, pos || 0)}
                onDelete={async () => {
                  try {
                    await apiService.deleteColumn(board.id, col.id);
                    await load();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                onEditCard={(card) => {
                  setEditingCard(card);
                  setCardForm({
                    title: card.title,
                    description: card.description,
                  });
                }}
                onDeleteCard={(card) => {
                  setDeletingCard(card);
                }}
              />
            </div>
          ))}

          <div className="w-80 flex-shrink-0">
            <div className="p-2 bg-gray-200 rounded-lg">
              <input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newColumnName.trim()) {
                    try {
                      await apiService.createColumn(board.id, newColumnName);
                      setNewColumnName("");
                      await load();
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+ Add another column"
              />
            </div>
          </div>
        </div>

        <Modal
          open={openNewCard}
          onClose={() => setOpenNewCard(false)}
          title="New Card"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenNewCard(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  addCard(activeColumnId ?? board.columns?.[0]?.id ?? 0)
                }
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Create
              </button>
            </div>
          }
        >
          <div>
            <label className="block text-sm">Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
        </Modal>

        {showBoardSettingsModal && (
          <BoardSettingsModal
            open={showBoardSettingsModal}
            onClose={() => setShowBoardSettingsModal(false)}
            onSubmit={handleUpdateBoard}
            initialData={board}
          />
        )}

        <Modal
          open={!!editingCard}
          onClose={() => setEditingCard(null)}
          title="Edit Card"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCard(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCard}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                value={cardForm.title}
                onChange={(e) =>
                  setCardForm({ ...cardForm, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={cardForm.description}
                onChange={(e) =>
                  setCardForm({ ...cardForm, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
          </div>
        </Modal>

        {deletingCard && (
          <Modal
            open={!!deletingCard}
            onClose={() => setDeletingCard(null)}
            title="Delete Card"
            size="sm"
            footer={
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeletingCard(null)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCard}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            }
          >
            <p>Are you sure you want to delete "{deletingCard.title}"?</p>
          </Modal>
        )}
      </div>
    </DndProvider>
  );
};

const ColumnComponent: React.FC<{
  col: Column;
  colorIndex: number;
  addCard: () => void;
  onDropCard: (cardId: number, pos: number) => void;
  onDelete?: () => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
}> = ({
  col,
  colorIndex,
  addCard,
  onDropCard,
  onDelete,
  onEditCard,
  onDeleteCard,
}) => {
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

  const [, drop] = useDrop(
    () => ({
      accept: "CARD",
      drop: (item: { id: number }) => {
        onDropCard(item.id, col.cards.length);
      },
    }),
    [onDropCard]
  );

  const bgColor = columnColors[colorIndex % columnColors.length];
  const headerColor =
    columnHeaderColors[colorIndex % columnHeaderColors.length];

  return (
    <div
      ref={drop as unknown as any}
      className={`${bgColor} rounded-xl p-2 flex flex-col h-full shadow-sm`}
    >
      <div
        className={`flex items-center justify-between mb-3 px-2 pt-2 pb-2 rounded-t-lg ${headerColor}`}
      >
        <h3 className="font-semibold text-gray-800">{col.name}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={addCard}
            className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-md"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-md"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && onDelete && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-lg shadow-lg z-10 text-left">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete Column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2 min-h-[20px] overflow-y-auto flex-grow px-1">
        {(col.cards || []).map((c, index) => (
          <CardItem
            key={c.id}
            card={c}
            index={index}
            columnName={col.name}
            colorIndex={colorIndex}
            onEdit={() => onEditCard(c)}
            onDelete={() => onDeleteCard(c)}
            onDropCard={onDropCard}
          />
        ))}
      </div>
      <button
        onClick={addCard}
        className="mt-2 w-full text-left flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-200 rounded-md"
      >
        <Plus className="h-4 w-4" /> Add a card
      </button>
    </div>
  );
};

const cardTagColors = [
  "bg-red-200 text-red-800",
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-yellow-200 text-yellow-800",
  "bg-purple-200 text-purple-800",
  "bg-pink-200 text-pink-800",
];

const CardItem: React.FC<{
  card: Card;
  index: number;
  columnName: string;
  colorIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  onDropCard: (cardId: number, pos: number) => void;
}> = ({
  card,
  index,
  columnName,
  colorIndex,
  onEdit,
  onDelete,
  onDropCard,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drag] = useDrag(
    () => ({ type: "CARD", item: { id: card.id, index } }),
    [card.id, index]
  );

  const [, drop] = useDrop({
    accept: "CARD",
    drop: (item: { id: number }) => {
      if (item.id !== card.id) {
        onDropCard(item.id, index);
      }
    },
  });

  const tagColor = cardTagColors[colorIndex % cardTagColors.length];
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 group"
    >
      <div className="flex justify-between items-start">
        <div className="font-medium text-gray-800 pr-2">{card.title}</div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1 hover:bg-gray-200 rounded">
            <Edit2 className="h-3 w-3 text-gray-600" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded">
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-1">{card.description}</div>
      <div className="mt-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor}`}
        >
          {columnName}
        </span>
      </div>
    </div>
  );
};

interface BoardSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateBoardRequest>) => void;
  initialData: Board;
}

const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialData.name);
      setDescription(initialData.description);
      setIsPublic(initialData.isPublic);
    }
  }, [open, initialData]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Board Settings"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ name, description, isPublic })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={!name.trim()}
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Board Name
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

export default BoardDetailPage;
