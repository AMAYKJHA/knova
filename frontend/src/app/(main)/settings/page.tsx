"use client";

import React, { useState, useEffect } from "react";
import {
  IdCard,
  User,
  Lock,
  Tag,
  HelpCircle,
  Info,
  Mail,
  LogOut,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { getTopics, Topic } from "@/lib/reference";
import { getMyInterests, updateMyInterests } from "@/lib/interests";
import { getProfile, updateProfile } from "@/lib/profile";
import { useAuth } from "@/context/AuthContext";

type ModalType = "personal" | "profile" | "password" | "topics" | null;

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] pb-24 font-sans selection:bg-orange-100">
      <main className="max-w-2xl mx-auto pt-10 px-4 sm:px-6 space-y-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
          Settings
        </h1>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wider px-1">
            Account
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsButton
              icon={<IdCard size={20} className="text-[#594137]" />}
              label="Personal Information"
              onClick={() => setActiveModal("personal")}
            />
            <Divider />
            <SettingsButton
              icon={<User size={20} className="text-[#594137]" />}
              label="Edit Profile"
              onClick={() => setActiveModal("profile")}
            />
            <Divider />
            <SettingsButton
              icon={<Lock size={20} className="text-[#594137]" />}
              label="Change Password"
              onClick={() => setActiveModal("password")}
            />
            <Divider />
            <SettingsButton
              icon={<Tag size={20} className="text-[#594137]" />}
              label="Preferred Topics"
              onClick={() => setActiveModal("topics")}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wider px-1">
            Support
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsButton
              icon={<HelpCircle size={20} className="text-[#594137]" />}
              label="Help / FAQ"
            />
            <Divider />
            <SettingsButton
              icon={<Info size={20} className="text-[#594137]" />}
              label="About"
            />
            <Divider />
            <SettingsButton
              icon={<Mail size={20} className="text-[#594137]" />}
              label="Contact Us"
            />
          </div>
        </section>

        <section>
          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:bg-red-50/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut size={18} className="text-red-600 ml-1" />
            </div>
            <span className="text-red-600 font-semibold text-sm">Log Out</span>
          </button>
        </section>
      </main>

      {activeModal && (
        <ModalWrapper onClose={closeModal}>
          {activeModal === "personal" && (
            <PersonalInfoModal onClose={closeModal} />
          )}
          {activeModal === "profile" && (
            <EditProfileModal onClose={closeModal} />
          )}
          {activeModal === "password" && (
            <ChangePasswordModal onClose={closeModal} />
          )}
          {activeModal === "topics" && (
            <PreferredTopicsModal onClose={closeModal} />
          )}
        </ModalWrapper>
      )}
    </div>
  );
}

// --- Subcomponents ---

function SettingsButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100 shadow-sm shadow-black/0 group-hover:shadow-black/5">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <ChevronRight
        size={18}
        className="text-gray-400 group-hover:text-gray-900 transition-colors"
      />
    </button>
  );
}

function Divider() {
  return <div className="h-[1px] bg-gray-100 mx-4" />;
}

function ModalWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[512px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// --- Specific Modals ---

function PersonalInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Personal Information
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-5 overflow-y-auto">
        <InfoField label="Username" value="@arivera_learns" />
        <InfoField label="Full Name" value="Alex Rivera" />
        <InfoField label="Email" value="alex.rivera@example.com" />
        <InfoField label="Date of Birth" value="August 12, 1995" />
      </div>
      <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#f36710] text-white hover:bg-[#d45600] active:scale-95 transition-all shadow-sm shadow-orange-500/20"
        >
          Close
        </button>
      </div>
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border border-gray-100 font-medium">
        {value}
      </div>
    </div>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the user's current profile so the fields reflect real, saved values.
  useEffect(() => {
    if (!user?.username) return;
    let active = true;
    getProfile(user.username)
      .then((p) => {
        if (!active) return;
        setUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatar_url ?? null);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.username]);

  const handleSave = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ username: username.trim(), bio });
      await refreshUser();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Edit Profile
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="p-6 overflow-y-auto space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100 relative">
                <Image
                  src={avatarUrl || "/logos/default-avatar.png"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-gray-900 transition-colors bg-gray-50/50 text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others what you're learning..."
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-gray-900 transition-colors h-28 resize-none bg-gray-50/50 text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Manage your learning interests under{" "}
            <span className="font-semibold text-gray-500">
              Preferred Topics
            </span>
            .
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      <div className="p-6 border-t border-gray-100 bg-white flex gap-3 sticky bottom-0">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex-1 h-12 bg-[#f36710] text-white text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 hover:bg-[#d45600] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Change Password
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-5 overflow-y-auto">
        <PasswordInput label="Current Password" />
        <PasswordInput label="New Password" />
        <PasswordInput label="Confirm New Password" />
      </div>
      <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#f36710] text-white hover:bg-[#d45600] active:scale-95 transition-all shadow-sm shadow-orange-500/20"
        >
          Update Password
        </button>
      </div>
    </>
  );
}

function PasswordInput({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-gray-900 transition-colors bg-gray-50/50 text-sm tracking-wider font-medium placeholder:tracking-normal"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PreferredTopicsModal({ onClose }: { onClose: () => void }) {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the full topic vocabulary + the user's current interests together.
  useEffect(() => {
    let active = true;
    Promise.all([getTopics(), getMyInterests()])
      .then(([topics, interests]) => {
        if (!active) return;
        setAllTopics(topics);
        setSelected(new Set(interests.map((i) => i.name)));
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load topics");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addTopic = (name: string) =>
    setSelected((prev) => new Set(prev).add(name));

  const removeTopic = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  // topics the user has picked (preserve the alphabetical topic order)
  const selectedTopics = allTopics.filter((t) => selected.has(t.name));

  // topics available to add: not selected, matching the search
  const q = search.trim().toLowerCase();
  const addable = allTopics.filter(
    (t) => !selected.has(t.name) && (!q || t.name.toLowerCase().includes(q)),
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateMyInterests([...selected]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save interests");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Preferred Topics
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-y-auto">
          {/* Your interests (removable) */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Your Interests
              </h4>
              <span className="text-xs font-semibold text-[#f36710]">
                {selected.size}
              </span>
            </div>
            {selectedTopics.length === 0 ? (
              <p className="text-sm text-gray-400">
                No interests yet. Add some below to personalize your feed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <span
                    key={topic.id}
                    className="px-3 py-1.5 bg-[#FEF3EA] text-[#f36710] text-sm font-semibold rounded-full flex items-center gap-1.5 border border-[#f36710]/20"
                  >
                    {topic.name}
                    <button
                      onClick={() => removeTopic(topic.name)}
                      className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${topic.name}`}
                    >
                      <X size={13} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="px-6 pt-4 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics to add..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-sm bg-gray-50/50 transition-colors"
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {/* Add topics */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {addable.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => addTopic(topic.name)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-[#f36710] hover:text-[#f36710] transition-all active:scale-95"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  {topic.name}
                </button>
              ))}
              {addable.length === 0 && (
                <p className="text-sm text-gray-400 py-4">
                  {q ? "No topics found." : "All topics added."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3 sticky bottom-0">
        <span className="text-xs font-medium text-gray-500">
          {selected.size} selected
        </span>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#f36710] text-white hover:bg-[#d45600] active:scale-95 transition-all shadow-sm shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Interests
          </button>
        </div>
      </div>
    </>
  );
}
