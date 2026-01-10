import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  LogOut,
  Ban,
  RotateCcw,
  Eye,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/lib/auth";
import { getUserProfile, updateUserProfile } from "@/lib/auth";
import { logAction, getAuditLogs } from "@/lib/auditService";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isBanned: boolean;
  banReason?: string;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  action: string;
  performedByName: string;
  targetUserName?: string;
  reason?: string;
  timestamp: Date;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check authorization
  useEffect(() => {
    if (!user || !userProfile) {
      navigate("/login");
      return;
    }

    if (userProfile.role !== "founder" && userProfile.role !== "admin") {
      navigate("/");
      return;
    }

    loadData();
  }, [user, userProfile, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const logs = await getAuditLogs();
      setAuditLogs(logs as AuditLog[]);

      // In a real app, you'd fetch all users from Firestore
      // For now, we'll show a placeholder
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (targetUser: User) => {
    if (!banReason.trim()) {
      toast.error("Please provide a ban reason");
      return;
    }

    try {
      await updateUserProfile(targetUser.uid, {
        isBanned: true,
        banReason,
        banDate: new Date(),
      });

      await logAction(
        "user_banned",
        user!.uid,
        userProfile!.displayName,
        targetUser.uid,
        targetUser.displayName,
        banReason,
      );

      toast.success(`${targetUser.displayName} has been banned`);
      setBanReason("");
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (targetUser: User) => {
    try {
      await updateUserProfile(targetUser.uid, {
        isBanned: false,
        banReason: undefined,
        banDate: undefined,
      });

      await logAction(
        "user_unbanned",
        user!.uid,
        userProfile!.displayName,
        targetUser.uid,
        targetUser.displayName,
      );

      toast.success(`${targetUser.displayName} has been unbanned`);
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="text-red-400" />
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, moderation, and audit logs
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "users"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={16} />
            Users & Moderation
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-3 px-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "logs"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock size={16} />
            Audit Logs
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Users</h2>
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {/* Placeholder for users list */}
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      User list will be populated from Firestore
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details / Ban Form */}
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">User Actions</h2>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{selectedUser.displayName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-sm capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p
                      className={`text-sm font-semibold ${
                        selectedUser.isBanned
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {selectedUser.isBanned ? "🔴 BANNED" : "🟢 ACTIVE"}
                    </p>
                  </div>

                  {selectedUser.isBanned ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Ban Reason</p>
                        <p className="text-sm">{selectedUser.banReason}</p>
                      </div>
                      <Button
                        onClick={() => handleUnbanUser(selectedUser)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Unban User
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <Textarea
                        placeholder="Enter ban reason..."
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={() => handleBanUser(selectedUser)}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Ban size={16} className="mr-2" />
                        Ban User
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="text-sm text-muted-foreground">
                    Select a user to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-secondary/50 rounded-lg text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">
                        {log.action.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleDateString()}{" "}
                        {log.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      By: <span className="text-foreground">{log.performedByName}</span>
                    </p>
                    {log.targetUserName && (
                      <p className="text-xs text-muted-foreground">
                        User: <span className="text-foreground">{log.targetUserName}</span>
                      </p>
                    )}
                    {log.reason && (
                      <p className="text-xs text-muted-foreground italic">
                        Reason: {log.reason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No audit logs yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
