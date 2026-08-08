import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "../components/GlassCard";
import {
  User as UserIcon,
  Lock,
  Mail,
  ShieldCheck,
  Key,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  Github,
  Linkedin,
  Bell,
  Check,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMentorProfile,
  updateMentorProfile,
  changeMentorPassword,
} from "../lib/admin-api";

export function MentorSettingsPage() {
  const queryClient = useQueryClient();

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [bio, setBio] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Fetch Mentor Profile
  const { data: mentor, isLoading } = useQuery({
    queryKey: ["adminMentorProfile"],
    queryFn: getMentorProfile,
  });

  useEffect(() => {
    if (mentor) {
      setName(mentor.name || "");
      setEmail(mentor.email || "");
      setTargetRole(mentor.targetRole || "Lead Placement Mentor");
      setBio(mentor.bio || "");
      setGithubUsername(mentor.githubUsername || "");
      setLinkedinUrl(mentor.linkedinUrl || "");
    }
  }, [mentor]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) => updateMentorProfile(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Profile credentials updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminMentorProfile"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile credentials");
    },
  });

  // Password Update Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (payload: any) => changeMentorPassword(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Password credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update password");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    updateProfileMutation.mutate({
      name,
      email,
      targetRole,
      bio,
      githubUsername,
      linkedinUrl,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new passwords");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Credential Management
          </span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-indigo-400" /> Mentor Profile & Security Settings
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account identity, security passcodes, and mentorship preferences
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Quick Identity Card */}
        <div className="space-y-6">
          <GlassCard className="p-6 text-center space-y-4 border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 via-slate-900/60 to-transparent">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] grid place-items-center text-2xl font-black text-white">
                {name ? name.charAt(0).toUpperCase() : "M"}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{name || "Mentor"}</h3>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">{targetRole || "Lead Placement Mentor"}</p>
              <p className="text-[11px] text-slate-400 mt-1">{email}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-center gap-3 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> Active Mentor
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Profile & Identity Credentials */}
          <GlassCard className="p-6 space-y-5 border-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <UserIcon className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Identity & Contact Credentials</h3>
                <p className="text-xs text-muted-foreground">Update your mentor public profile & contact information</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Mentor Name"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mentor Account Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mentor@careerforge.ai"
                      className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mentor Title / Specialization
                  </label>
                  <div className="relative">
                    <Briefcase className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Lead Placement Mentor / Full Stack Specialist"
                      className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <Github className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="mentor-github"
                      className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Professional Bio / Mentorship Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your technical background, office hours, and placement guidance focus..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile Credentials
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Card 2: Security & Password Credentials */}
          <GlassCard className="p-6 space-y-5 border-purple-500/20">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Key className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white">Passcode & Security Credentials</h3>
                <p className="text-xs text-muted-foreground">Update your mentor workspace sign-in password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Current Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl pl-9 pr-10 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters..."
                      className="w-full glass-input rounded-xl pl-9 pr-10 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password..."
                      className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Update Password Credentials
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
