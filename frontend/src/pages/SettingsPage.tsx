import React, { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { apiService } from "../services/api";
import type { UserResponse } from "../types";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";

type Tab = "profile";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [me, setMe] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCurrentUser();
      setMe(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">Loading profile...</div>
    );
  }

  if (!me) {
    return (
      <div className="py-24 text-center text-gray-500">No profile found.</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <ProfileSettings user={me} onUpdate={loadUser} />
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsSidebar: React.FC<{
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}> = ({ activeTab, setActiveTab }) => {
  const navItems = [{ id: "profile", label: "Profile", icon: UserIcon }];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as Tab)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === item.id
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const ProfileSettings: React.FC<{
  user: UserResponse;
  onUpdate: () => void;
}> = ({ user, onUpdate }) => {
  const { addToast } = useToast();
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await apiService.updateCurrentUser(form);
      setIsEditing(false);
      addToast("Profile updated successfully!", "success");
      updateUser(updatedUser);
      onUpdate();
    } catch (error) {
      addToast("Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name, username: user.username, email: user.email });
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal information.
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <SettingRow label="Full Name">
            {isEditing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2"
              />
            ) : (
              <span className="text-gray-800">{user.name}</span>
            )}
          </SettingRow>
          <SettingRow label="Username">
            {isEditing ? (
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2"
              />
            ) : (
              <span className="text-gray-800">@{user.username}</span>
            )}
          </SettingRow>
          <SettingRow label="Email">
            {isEditing ? (
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2"
              />
            ) : (
              <span className="text-gray-800">{user.email}</span>
            )}
          </SettingRow>
        </div>
      </div>
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <div className="col-span-2">{children}</div>
  </div>
);

export default SettingsPage;
