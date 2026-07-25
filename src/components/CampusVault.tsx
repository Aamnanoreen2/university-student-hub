import React, { useState } from "react";
import { InfoVault, QuickLink, StudentProfile } from "../types";
import {
  Plus,
  Trash2,
  Key,
  Globe,
  Link,
  Mail,
  ShieldAlert,
  Sparkles,
  Wifi,
  BookOpen,
  Edit2,
  Save,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  BadgeCheck,
  Phone
} from "lucide-react";

interface CampusVaultProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  vault: InfoVault;
  onUpdateVault: (updated: Partial<InfoVault>) => void;
  onAddQuickLink: (link: Omit<QuickLink, "id">) => void;
  onDeleteQuickLink: (id: string) => void;
}

export default function CampusVault({
  profile,
  onUpdateProfile,
  vault,
  onUpdateVault,
  onAddQuickLink,
  onDeleteQuickLink,
}: CampusVaultProps) {
  // Student Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [pName, setPName] = useState(profile.studentName);
  const [pId, setPId] = useState(profile.studentId);
  const [pUniversity, setPUniversity] = useState(profile.university);
  const [pDepartment, setPDepartment] = useState(profile.department);
  const [pDegree, setPDegree] = useState(profile.degree);
  const [pSemester, setPSemester] = useState(profile.semester);
  const [pBatch, setPBatch] = useState(profile.batch);
  const [pEmail, setPEmail] = useState(profile.email);
  const [pPhone, setPPhone] = useState(profile.phone);

  // Locker Form State
  const [editingCreds, setEditingCreds] = useState(false);
  const [studentId, setStudentId] = useState(vault.studentId || profile.studentId);
  const [advisorName, setAdvisorName] = useState(vault.advisorName);
  const [advisorEmail, setAdvisorEmail] = useState(vault.advisorEmail);
  const [lmsUrl, setLmsUrl] = useState(vault.lmsUrl);
  const [libraryUrl, setLibraryUrl] = useState(vault.libraryUrl);
  const [wifiNetwork, setWifiNetwork] = useState(vault.wifiNetwork);
  const [wifiPassword, setWifiPassword] = useState(vault.wifiPassword);

  // New Link form state
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      studentName: pName,
      studentId: pId,
      university: pUniversity,
      department: pDepartment,
      degree: pDegree,
      semester: pSemester,
      batch: pBatch,
      email: pEmail,
      phone: pPhone,
    });
    // Also sync student ID in vault if needed
    onUpdateVault({ studentId: pId });
    setEditingProfile(false);
  };

  const handleSaveLocker = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVault({
      studentId,
      advisorName,
      advisorEmail,
      lmsUrl,
      libraryUrl,
      wifiNetwork,
      wifiPassword,
    });
    setEditingCreds(false);
  };

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onAddQuickLink({
      label: newLinkLabel.trim(),
      url: formattedUrl,
    });

    setNewLinkLabel("");
    setNewLinkUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Centralized Student Identity Notice */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-indigo-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold mb-2">
              <BadgeCheck className="h-4 w-4 text-indigo-300" />
              <span>Single Source of Truth</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Student Profile & Campus Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Your centralized identity profile automatically syncs student name, ID, degree, and university details across the Transcript Generator, Scholarship Finder, Career Hub, and Resume Builder without asking you twice.
            </p>
          </div>

          <div className="bg-indigo-900/70 border border-indigo-700/60 rounded-2xl p-4 text-xs shrink-0 flex items-center gap-3">
            <User className="h-8 w-8 text-indigo-300 bg-indigo-800/80 p-1.5 rounded-xl" />
            <div>
              <p className="font-bold text-white text-sm">{profile.studentName}</p>
              <p className="text-indigo-200 font-mono text-xs">{profile.studentId} • {profile.degree}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Student Profile & Locker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Official Student Profile */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Official Student Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Central academic identity used across all portal documents</p>
              </div>
              {!editingProfile && (
                <button
                  onClick={() => {
                    setPName(profile.studentName);
                    setPId(profile.studentId);
                    setPUniversity(profile.university);
                    setPDepartment(profile.department);
                    setPDegree(profile.degree);
                    setPSemester(profile.semester);
                    setPBatch(profile.batch);
                    setPEmail(profile.email);
                    setPPhone(profile.phone);
                    setEditingProfile(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-indigo-200"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Student ID / Roll Number</label>
                    <input
                      type="text"
                      required
                      value={pId}
                      onChange={(e) => setPId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">University Name</label>
                    <input
                      type="text"
                      value={pUniversity}
                      onChange={(e) => setPUniversity(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Department / Faculty</label>
                    <input
                      type="text"
                      value={pDepartment}
                      onChange={(e) => setPDepartment(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Degree Program</label>
                    <input
                      type="text"
                      value={pDegree}
                      onChange={(e) => setPDegree(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Current Semester</label>
                    <input
                      type="text"
                      value={pSemester}
                      onChange={(e) => setPSemester(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Batch / Class Year</label>
                    <input
                      type="text"
                      value={pBatch}
                      onChange={(e) => setPBatch(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Student Email Address</label>
                    <input
                      type="email"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Student Profile
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profile.studentName}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID / Roll No</p>
                    <p className="text-sm font-mono font-bold text-indigo-700 mt-0.5">{profile.studentId}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Degree Program</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profile.degree}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">University</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.university}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.department}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Semester & Batch</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{profile.semester} • {profile.batch}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 truncate">{profile.email}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{profile.phone || "Not set"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Campus Credentials Locker */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center">
                  <Key className="mr-2 h-4.5 w-4.5 text-indigo-600" />
                  Campus Credentials & Network Locker
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Keep advisor contacts, LMS shortcuts, and Wi-Fi codes accessible</p>
              </div>
              {!editingCreds && (
                <button
                  onClick={() => setEditingCreds(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Locker
                </button>
              )}
            </div>

            {editingCreds ? (
              <form onSubmit={handleSaveLocker} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Advisor Name</label>
                    <input
                      type="text"
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Advisor Email</label>
                    <input
                      type="email"
                      value={advisorEmail}
                      onChange={(e) => setAdvisorEmail(e.target.value)}
                      placeholder="e.g. apendelton@university.edu"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Campus Wi-Fi SSID</label>
                    <input
                      type="text"
                      value={wifiNetwork}
                      onChange={(e) => setWifiNetwork(e.target.value)}
                      placeholder="e.g. Eduroam_Secure"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Wi-Fi Passkey</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="e.g. campuspass123"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">LMS Portal URL</label>
                    <input
                      type="text"
                      value={lmsUrl}
                      onChange={(e) => setLmsUrl(e.target.value)}
                      placeholder="e.g. canvas.university.edu"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Library Login Portal URL</label>
                    <input
                      type="text"
                      value={libraryUrl}
                      onChange={(e) => setLibraryUrl(e.target.value)}
                      placeholder="e.g. library.university.edu/login"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAdvisorName(vault.advisorName);
                      setAdvisorEmail(vault.advisorEmail);
                      setLmsUrl(vault.lmsUrl);
                      setLibraryUrl(vault.libraryUrl);
                      setWifiNetwork(vault.wifiNetwork);
                      setWifiPassword(vault.wifiPassword);
                      setEditingCreds(false);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Locker
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Advisor</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{vault.advisorName || "Not configured"}</p>
                    {vault.advisorEmail && (
                      <a
                        href={`mailto:${vault.advisorEmail}`}
                        className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1 mt-1"
                      >
                        <Mail className="h-3.5 w-3.5" /> {vault.advisorEmail}
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LMS Canvas/Blackboard</p>
                      {vault.lmsUrl ? (
                        <a
                          href={vault.lmsUrl.startsWith("http") ? vault.lmsUrl : `https://${vault.lmsUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline font-semibold block mt-1"
                        >
                          Open LMS Portal
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Not configured</p>
                      )}
                    </div>
                    <Globe className="h-5 w-5 text-indigo-500 bg-indigo-50 p-1 rounded-lg shrink-0" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Wi-Fi</p>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{vault.wifiNetwork || "Not configured"}</p>
                      {vault.wifiPassword && (
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Key: {vault.wifiPassword}</p>
                      )}
                    </div>
                    <Wifi className="h-5 w-5 text-indigo-500 bg-indigo-50 p-1 rounded-lg shrink-0" />
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">University Library Portal</p>
                      {vault.libraryUrl ? (
                        <a
                          href={vault.libraryUrl.startsWith("http") ? vault.libraryUrl : `https://${vault.libraryUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline font-semibold block mt-1"
                        >
                          Search Catalogs
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Not configured</p>
                      )}
                    </div>
                    <BookOpen className="h-5 w-5 text-indigo-500 bg-indigo-50 p-1 rounded-lg shrink-0" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bookmark Manager */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col h-full">
            <h3 className="text-base font-bold text-slate-800 flex items-center mb-3.5">
              <Link className="mr-2 h-4.5 w-4.5 text-indigo-600" />
              Resource Bookmarks
            </h3>

            <div className="space-y-2 flex-1 max-h-80 overflow-y-auto mb-4 pr-1">
              {vault.links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-transparent rounded-xl hover:bg-slate-100/50 transition text-left"
                >
                  <div className="truncate pr-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-xs text-slate-800 hover:text-indigo-600 hover:underline truncate block"
                    >
                      {link.label}
                    </a>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{link.url}</p>
                  </div>

                  <button
                    onClick={() => onDeleteQuickLink(link.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-1 rounded-lg shrink-0"
                    title="Remove bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {vault.links.length === 0 && (
                <div className="text-center py-8">
                  <Link className="h-8 w-8 text-slate-200 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No custom shortcuts saved yet.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddLinkSubmit} className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Add Resource Shortcut</p>
              <input
                type="text"
                required
                placeholder="e.g. Course Syllabus Drive"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="e.g. drive.google.com/class"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Save Shortcut
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
