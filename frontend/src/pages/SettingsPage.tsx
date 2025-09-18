import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import type { User } from "../types";
import Modal from "../components/ui/Modal";

const SettingsPage: React.FC = () => {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "" });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCurrentUser();
      setMe(data);
      setForm({ name: data.name, username: data.username, email: data.email });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await apiService.updateCurrentUser(form);
    setOpenEdit(false);
    await load();
  };

  if (loading)
    return (
      <div className="py-24 text-center text-gray-500">Loading profile...</div>
    );
  if (!me)
    return (
      <div className="py-24 text-center text-gray-500">No profile found.</div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white grid place-items-center text-xl font-semibold">
            {me.name.charAt(0)}
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{me.name}</div>
            <div className="text-gray-600">
              @{me.username} • {me.email}
            </div>
            <div className="text-sm text-gray-500">
              Role: {me.role.replace("_", " ")}
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setOpenEdit(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Edit Profile"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenEdit(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={save}
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
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
