import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { apiService } from "../services/api";
import type { Board, Column, Card } from "../types";
import Modal from "../components/ui/Modal";

const BoardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [openNewCard, setOpenNewCard] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState("");

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

  const moveCard = async (
    cardId: number,
    toColumnId: number,
    toPosition: number
  ) => {
    try {
      await apiService.moveCard(cardId, toColumnId, toPosition);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6">Loading board...</div>;
  if (!board) return <div className="p-6">Board not found</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600"
          >
            Back
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {board.columns.map((col) => (
            <div key={col.id} className="w-80 flex-shrink-0">
              <ColumnColumn
                col={col}
                addCard={() => {
                  setActiveColumnId(col.id);
                  setOpenNewCard(true);
                }}
                onDropCard={(cardId, pos) => moveCard(cardId, col.id, pos)}
                onDelete={async () => {
                  try {
                    await apiService.deleteColumn(board.id, col.id);
                    await load();
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            </div>
          ))}

          <div className="w-80 flex-shrink-0">
            <div className="p-4 bg-white rounded border">
              <div className="text-sm font-medium mb-2">Add Milestone</div>
              <input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full rounded border px-2 py-1 mb-2"
                placeholder="Column name"
              />
              <button
                onClick={async () => {
                  if (!newColumnName.trim()) return;
                  try {
                    await apiService.createColumn(board.id, newColumnName);
                    setNewColumnName("");
                    await load();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              >
                Add
              </button>
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
      </div>
    </DndProvider>
  );
};

const ColumnColumn: React.FC<{
  col: Column;
  addCard: () => void;
  onDropCard: (cardId: number, pos: number) => void;
  onDelete?: () => void;
}> = ({ col, addCard, onDropCard, onDelete }) => {
  const [, drop] = useDrop(
    () => ({
      accept: "CARD",
      drop: (item: { id: number }) => {
        onDropCard(item.id, 0);
      },
    }),
    [onDropCard]
  );

  return (
    <div ref={drop as unknown as any} className="bg-white rounded p-4 border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{col.name}</h3>
        <div className="flex items-center gap-2">
          <button onClick={addCard} className="text-xs text-blue-600">
            + Task
          </button>
          {onDelete && (
            <button onClick={onDelete} className="text-xs text-red-500">
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 min-h-[80px]">
        {(col.cards || []).map((c) => (
          <CardItem key={c.id} card={c} />
        ))}
      </div>
    </div>
  );
};

const CardItem: React.FC<{ card: Card }> = ({ card }) => {
  const [, drag] = useDrag(
    () => ({ type: "CARD", item: { id: card.id } }),
    [card.id]
  );
  return (
    <div
      ref={drag as unknown as any}
      className="p-3 bg-gray-50 rounded shadow-sm"
    >
      <div className="font-medium">{card.title}</div>
      <div className="text-xs text-gray-500">{card.description}</div>
    </div>
  );
};

export default BoardDetailPage;
