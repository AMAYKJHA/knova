"use client";

import React, { useState, useEffect } from 'react';
import {
  IdCard, User, Lock, Tag, HelpCircle, Info, Mail, LogOut,
  ChevronRight, X, Camera, Eye, EyeOff, Check, Plus
} from 'lucide-react';
import Image from 'next/image';

type ModalType = 'personal' | 'profile' | 'password' | 'topics' | null;

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] pb-24 font-sans selection:bg-orange-100">
      <main className="max-w-2xl mx-auto pt-10 px-4 sm:px-6 space-y-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Settings</h1>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wider px-1">Account</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsButton
              icon={<IdCard size={20} className="text-[#594137]" />}
              label="Personal Information"
              onClick={() => setActiveModal('personal')}
            />
            <Divider />
            <SettingsButton
              icon={<User size={20} className="text-[#594137]" />}
              label="Edit Profile"
              onClick={() => setActiveModal('profile')}
            />
            <Divider />
            <SettingsButton
              icon={<Lock size={20} className="text-[#594137]" />}
              label="Change Password"
              onClick={() => setActiveModal('password')}
            />
            <Divider />
            <SettingsButton
              icon={<Tag size={20} className="text-[#594137]" />}
              label="Preferred Topics"
              onClick={() => setActiveModal('topics')}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wider px-1">Support</h2>
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
          {activeModal === 'personal' && <PersonalInfoModal onClose={closeModal} />}
          {activeModal === 'profile' && <EditProfileModal onClose={closeModal} />}
          {activeModal === 'password' && <ChangePasswordModal onClose={closeModal} />}
          {activeModal === 'topics' && <PreferredTopicsModal onClose={closeModal} />}
        </ModalWrapper>
      )}
    </div>
  );
}

// --- Subcomponents ---

function SettingsButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
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
      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
    </button>
  );
}

function Divider() {
  return <div className="h-[1px] bg-gray-100 mx-4" />;
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center sm:p-4 p-0">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col min-h-[400px] max-h-[90vh] overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
      >
        {children}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}

// --- Specific Modals ---

function PersonalInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Personal Information</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border border-gray-100 font-medium">
        {value}
      </div>
    </div>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const [interests, setInterests] = useState(['Computer Science', 'UX Design', 'Psychology']);

  const removeInterest = (topic: string) => {
    setInterests(interests.filter((t) => t !== topic));
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Edit Profile</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100 relative">
              <Image
                src="/default-avatar.png"
                alt="Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#f36710] rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm hover:scale-105 active:scale-95 transition-all">
              <Camera size={14} />
            </button>
          </div>
          <button className="text-xs font-bold text-[#f36710] hover:underline">
            Change Photo
          </button>
        </div>

        <div className="space-y-5">
          <InputField label="Full Name" defaultValue="Alex Rivera" />
          <InputField label="Username" defaultValue="arivera_learns" />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
            <textarea
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-gray-900 transition-colors h-28 resize-none bg-gray-50/50 text-sm"
              defaultValue="Exploring the intersection of Computer Science and cognitive psychology. Always building new learning pathways. 🚀"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interests.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 bg-[#FEF3EA] text-[#f36710] text-xs font-semibold rounded-full flex items-center gap-1.5 border border-[#f36710]/20"
              >
                {topic}
                <button
                  onClick={() => removeInterest(topic)}
                  className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
            <button className="px-4 py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs font-semibold rounded-full hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Add Topic
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-100 bg-white flex gap-3 sticky bottom-0">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="flex-1 h-12 bg-[#f36710] text-white text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 hover:bg-[#d45600] active:scale-[0.98] transition-all"
        >
          Save Changes
        </button>
      </div>
    </>
  );
}

function InputField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#f36710] focus:ring-1 focus:ring-[#f36710] outline-none text-gray-900 transition-colors bg-gray-50/50 text-sm font-medium"
      />
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Change Password</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
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
  const allTopics = [
    'DBMS', 'Computer Networks', 'Biology', 'Machine Learning',
    'Physics', 'Web Development', 'Data Structures', 'Geography',
    'Psychology', 'Design', 'History'
  ];
  
  const [selected, setSelected] = useState<string[]>(['Computer Networks', 'Machine Learning', 'Data Structures']);

  const toggleTopic = (topic: string) => {
    if (selected.includes(topic)) {
      setSelected(selected.filter(t => t !== topic));
    } else {
      setSelected([...selected, topic]);
    }
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Preferred Topics</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-6">
          Select the topics you&apos;re interested in to personalize your learning feed.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {allTopics.map(topic => {
            const isSelected = selected.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all active:scale-95 ${
                  isSelected 
                    ? 'bg-[#FEF3EA] border-[#f36710] text-[#f36710]' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {topic}
                {isSelected && <Check size={16} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
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
          Save Interests
        </button>
      </div>
    </>
  );
}
