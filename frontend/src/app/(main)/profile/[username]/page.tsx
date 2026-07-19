"use client";

import React, { useState, useEffect } from "react";
import { Grid, BarChart2, ArrowUp, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/profile";

interface StatItem {
  name: string;
  score: number;
}

export default function ProfileScreen({
  setCurrentScreen,
}: {
  setCurrentScreen?: (screen: string) => void;
}) {
  const { username } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "stats">("posts");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { user, refreshUser } = useAuth();
  const { profile, setProfile, loading, error } = useProfile(
    username as string,
  );

  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (profile && isEditing) {
      setEditUsername(profile.username);
      setEditBio(profile.bio || "");
    }
  }, [profile, isEditing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 text-center py-10 font-semibold">
        {error}
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="text-stone-500 text-center py-10 font-semibold">
        User not found
      </div>
    );
  }

  const isOwnProfile =
    user?.username.toLowerCase() === (username as string).toLowerCase();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      const updated = await updateProfile({
        username: editUsername,
        bio: editBio,
      });
      setProfile(updated);
      setIsEditing(false);
      if (
        updated.username.toLowerCase() !== (username as string).toLowerCase()
      ) {
        router.push(`/profile/${updated.username}`);
      }
      await refreshUser();
    } catch (err) {
      if (err instanceof Error) {
        setSaveError(err.message);
      } else {
        setSaveError("Failed to save changes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const statsData: StatItem[] = [
    { name: "Cognitive Psychology", score: 94 },
    { name: "Algorithm Design", score: 88 },
    { name: "Molecular Biology", score: 72 },
    { name: "Global Economics", score: 64 },
  ];

  return (
    <div className="max-w-[880px] mx-auto p-4 space-y-6">
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-6 relative">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-[#efeded] shrink-0 mx-auto md:mx-0">
          <Image
            src={profile.avatar_url || "/logos/default-avatar.png"}
            alt={profile.username}
            width={120}
            height={120}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1b1c1c]">
                {profile.username}
              </h1>
              <p className="text-[#5c5c5c] text-sm md:mt-1">
                @{profile.username}
              </p>
              <div className="flex gap-4 mt-3 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#1b1c1c]">
                    {profile.followers}
                  </span>
                  <span className="text-sm text-[#5c5c5c]">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#1b1c1c]">
                    {profile.following}
                  </span>
                  <span className="text-sm text-[#5c5c5c]">Following</span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 border border-[#d9d9d9] text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] transition active:scale-95"
              >
                Edit Profile
              </button>
            )}
          </div>
          <p className="text-sm text-[#5c5c5c] leading-relaxed mt-5">
            {profile.bio}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
            {profile.primary_topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 bg-[#fef3ea] text-[#f36710] rounded-full text-xs font-semibold tracking-wide"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
          <p className="text-[10px] md:text-xs text-[#5c5c5c] uppercase tracking-wider font-semibold">
            Posts created
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#1b1c1c] mt-2">
            {profile.posts}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
          <p className="text-[10px] md:text-xs text-[#5c5c5c] uppercase tracking-wider font-semibold">
            Topics Covered
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#1b1c1c] mt-2">
            {profile.primary_topics.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
          <p className="text-[10px] md:text-xs text-[#5c5c5c] uppercase tracking-wider font-semibold">
            Accuracy
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#f36710] mt-2">
            {profile.authority_score.toFixed(0)}%
          </p>
        </div>
      </section>

      <section className="bg-white rounded-full p-1 flex relative w-max mx-auto shadow-sm border border-[#efeded]">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#fef3ea] rounded-full transition-transform duration-300 ${activeTab === "stats" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"}`}
        ></div>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 px-8 py-2 flex items-center justify-center gap-2 font-semibold relative z-10 transition-colors ${activeTab === "posts" ? "text-[#f36710]" : "text-[#5c5c5c]"}`}
        >
          <Grid className="w-4 h-4" />
          <span className="text-sm">Posts</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 px-8 py-2 flex items-center justify-center gap-2 font-semibold relative z-10 transition-colors ${activeTab === "stats" ? "text-[#f36710]" : "text-[#5c5c5c]"}`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-sm">Stats</span>
        </button>
      </section>

      {activeTab === "posts" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer ${i % 2 === 0 ? "bg-[#fef3ea] border border-[#f36710]/10" : "bg-white border border-[#d9d9d9]/30 border-l-[3px] border-l-[#00afef]"}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#00afef]">
                  {i % 2 !== 0 ? "Note" : ""}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i % 2 === 0 ? "bg-white/80 text-[#f36710]" : "bg-[#e0f6fe] text-[#00afef]"}`}
                >
                  {i % 2 === 0 ? "FlashCard" : "Deep Dive"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1b1c1c] leading-tight line-clamp-3">
                {i % 2 === 0
                  ? "What is the difference between a process and a thread?"
                  : "Cognitive Load Theory in Digital Environments"}
              </h3>
              <div className="flex items-center justify-end gap-1 text-[#f36710] mt-2">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-bold">{12 + i * 7}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="pb-8 space-y-4">
          {statsData.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-end">
                <span className="font-bold text-[#1b1c1c]">{item.name}</span>
                <span
                  className={`text-sm font-bold ${item.score > 80 ? "text-[#f36710]" : "text-[#8d7165]"}`}
                >
                  {item.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.score > 80 ? "bg-[#00afef]" : "bg-[#f36710]"}`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-2 hover:bg-[#f5f5f5] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#594137]" />
            </button>
            <h2 className="text-2xl font-bold mb-8">Edit Profile</h2>
            <div className="space-y-5">
              {saveError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {saveError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#5c5c5c] tracking-wider uppercase">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-[#5c5c5c]">
                    @
                  </span>
                  <input
                    className="w-full border border-[#d9d9d9] rounded-xl pl-8 pr-4 py-3.5 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none transition-all"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#5c5c5c] tracking-wider uppercase">
                  Bio
                </label>
                <textarea
                  className="w-full border border-[#d9d9d9] rounded-xl px-4 py-3.5 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none resize-none h-28 transition-all"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-[#f36710] hover:bg-[#d45600] text-white font-bold py-4 rounded-xl mt-6 shadow-md transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
