"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfo from "@/components/profile/PersonalInfo";
import FinancialGoals from "@/components/profile/FinancialGoals";
import ProfileActions from "@/components/profile/ProfileActions";
import AccountSettings from "@/components/profile/AccountSettings";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [formData, setFormData] = useState({
    full_name: "",
    risk_profile: "",
    financial_goals: {
      short_term: [] as string[],
      medium_term: [] as string[],
      long_term: [] as string[],
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{
    name: string;
    term: "short_term" | "medium_term" | "long_term";
  } | null>(null);
  const [goalProgress, setGoalProgress] = useState({
    current: 0,
    target: 0,
    deadline: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace("/login");
          return;
        }
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
          return;
        }
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          risk_profile: data.risk_profile || "",
          financial_goals: (data.financial_goals as typeof formData.financial_goals) || {
            short_term: [],
            medium_term: [],
            long_term: [],
          },
        });
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router, supabase]);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (formData.full_name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    if (!formData.risk_profile) {
      toast.error("Please select your risk profile");
      return false;
    }
    const hasGoals = Object.values(formData.financial_goals).some((arr) => arr.length > 0);
    if (!hasGoals) {
      toast.error("Please select at least one financial goal");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: user.id,
            email: user.email!,
            full_name: formData.full_name.trim(),
            risk_profile: formData.risk_profile,
            financial_goals: formData.financial_goals,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();
      if (error) throw new Error(error.message);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name.trim(),
              risk_profile: formData.risk_profile,
              financial_goals: formData.financial_goals,
            }
          : null
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = async (
    term: "short_term" | "medium_term" | "long_term",
    goal: string
  ) => {
    const isSelected = formData.financial_goals[term].includes(goal);
    if (!isSelected) {
      setSelectedGoal({ name: goal, term });
      setGoalProgress({
        current: 0,
        target: 0,
        deadline: new Date().toISOString().split("T")[0],
      });
      setIsModalOpen(true);
    } else {
      try {
        const { error } = await supabase
          .from("financial_goals")
          .delete()
          .eq("user_id", profile!.id)
          .eq("title", goal)
          .eq("category", term);
        if (error) throw error;
        setFormData((prev) => ({
          ...prev,
          financial_goals: {
            ...prev.financial_goals,
            [term]: prev.financial_goals[term].filter((g) => g !== goal),
          },
        }));
      } catch (error) {
        console.error("Error deleting goal:", error);
        toast.error("Failed to delete goal");
      }
    }
  };

  const handleSaveGoalProgress = async () => {
    if (!selectedGoal) return;
    try {
      if (goalProgress.current < 0 || goalProgress.target <= 0) {
        toast.error("Please enter valid amounts");
        return;
      }
      if (!goalProgress.deadline) {
        toast.error("Please select a deadline");
        return;
      }
      const { error: insertError } = await supabase.from("financial_goals").insert({
        user_id: profile!.id,
        title: selectedGoal.name,
        current_amount: Number(goalProgress.current),
        target_amount: Number(goalProgress.target),
        deadline: new Date(goalProgress.deadline).toISOString(),
        category: selectedGoal.term,
        status: "active",
      });
      if (insertError) throw insertError;
      setFormData((prev) => ({
        ...prev,
        financial_goals: {
          ...prev.financial_goals,
          [selectedGoal.term]: [...prev.financial_goals[selectedGoal.term], selectedGoal.name],
        },
      }));
      setIsModalOpen(false);
      setSelectedGoal(null);
      toast.success("Goal added successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add goal";
      toast.error(msg);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!mounted) return null;

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--finsight-bg)]">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[var(--finsight-accent-blue)] animate-bounce" />
          <div className="h-3 w-3 rounded-full bg-[var(--finsight-accent-blue)] animate-bounce [animation-delay:0.2s]" />
          <div className="h-3 w-3 rounded-full bg-[var(--finsight-accent-blue)] animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const tabButtonClass = (active: boolean) =>
    `px-6 py-4 text-sm font-medium transition-colors ${
      active
        ? "border-b-2 border-[var(--finsight-accent-blue)] text-[var(--finsight-accent-blue)]"
        : "text-[var(--finsight-muted-text)] hover:text-[var(--finsight-primary-text)]"
    }`;

  return (
    <div className="min-h-screen bg-[var(--finsight-bg)] py-12 px-4 finsight-grid-bg sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <div className="overflow-hidden rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_var(--finsight-border)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
          <ProfileHeader />

          {!profile?.full_name && !isEditing && (
            <div className="border-b border-[var(--finsight-border)] bg-[var(--finsight-accent-blue)]/10 px-6 py-4">
              <p className="text-sm text-[var(--finsight-primary-text)]">
                Welcome! Please complete your profile by clicking &quot;Edit Profile&quot; below. This will help personalize your experience with FinSight.
              </p>
            </div>
          )}

          <div className="border-b border-[var(--finsight-border)]">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={tabButtonClass(activeTab === "profile")}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={tabButtonClass(activeTab === "settings")}
              >
                Account settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "profile" ? (
              <>
                {isEditing ? (
                  <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfo
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />
                    <FinancialGoals
                      isEditing={isEditing}
                      goals={formData.financial_goals}
                      onGoalChange={handleGoalChange}
                    />
                    <ProfileActions
                      isEditing={isEditing}
                      isLoading={isLoading}
                      onBack={handleBack}
                      onEdit={() => setIsEditing(true)}
                      onCancel={() => setIsEditing(false)}
                    />
                  </form>
                ) : (
                  <>
                    <PersonalInfo
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />
                    <FinancialGoals
                      isEditing={isEditing}
                      goals={formData.financial_goals}
                      onGoalChange={handleGoalChange}
                    />
                    <ProfileActions
                      isEditing={isEditing}
                      isLoading={isLoading}
                      onBack={handleBack}
                      onEdit={() => setIsEditing(true)}
                      onCancel={() => setIsEditing(false)}
                    />
                  </>
                )}
              </>
            ) : (
              <AccountSettings />
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-xl border border-[var(--finsight-border)] bg-[var(--finsight-card)] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--finsight-primary-text)]">
                  Set goal progress
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-[var(--finsight-muted-text)] transition-colors hover:bg-[var(--finsight-surface)] hover:text-[var(--finsight-primary-text)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-primary-text)]">
                    Current amount
                  </label>
                  <input
                    type="number"
                    value={goalProgress.current || ""}
                    onChange={(e) =>
                      setGoalProgress((prev) => ({
                        ...prev,
                        current: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2 text-[var(--finsight-primary-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20"
                    min={0}
                    step={100}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-primary-text)]">
                    Target amount
                  </label>
                  <input
                    type="number"
                    value={goalProgress.target || ""}
                    onChange={(e) =>
                      setGoalProgress((prev) => ({
                        ...prev,
                        target: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2 text-[var(--finsight-primary-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20"
                    min={0}
                    step={100}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--finsight-primary-text)]">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={goalProgress.deadline}
                    onChange={(e) =>
                      setGoalProgress((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2 text-[var(--finsight-primary-text)] focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-4 py-2 text-sm font-medium text-[var(--finsight-primary-text)] transition-colors hover:bg-[var(--finsight-card)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGoalProgress}
                    className="rounded-lg bg-[var(--finsight-accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  >
                    Save goal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
