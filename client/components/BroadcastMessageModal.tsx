import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendBroadcastMessage } from "@/lib/broadcastService";

interface User {
  uid: string;
  displayName: string;
  role: string;
}

interface BroadcastMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  senderId: string;
  users: User[];
  onSuccess?: () => void;
}

export function BroadcastMessageModal({
  isOpen,
  onClose,
  senderName,
  senderId,
  users,
  onSuccess,
}: BroadcastMessageModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "specific">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    if (recipientType === "specific" && selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setSending(true);
    try {
      await sendBroadcastMessage(
        senderId,
        senderName,
        title,
        message,
        recipientType,
        recipientType === "specific" ? selectedUsers : undefined,
      );

      toast.success("Message sent successfully");
      setTitle("");
      setMessage("");
      setSelectedUsers([]);
      setRecipientType("all");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border/40 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 sticky top-0 bg-card">
          <h2 className="text-xl font-bold">Send Broadcast Message</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Important Announcement"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/100
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/1000
            </p>
          </div>

          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium mb-3">Send To</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === "all"}
                  onChange={(e) => setRecipientType(e.target.value as "all")}
                  className="w-4 h-4"
                />
                <span className="text-sm">All Users ({users.length})</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  value="specific"
                  checked={recipientType === "specific"}
                  onChange={(e) =>
                    setRecipientType(e.target.value as "specific")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Specific Users</span>
              </label>
            </div>
          </div>

          {/* User Selection */}
          {recipientType === "specific" && (
            <div>
              <label className="block text-sm font-medium mb-3">
                Select Recipients ({selectedUsers.length})
              </label>
              <div className="max-h-48 overflow-y-auto border border-border/30 rounded-lg p-3 space-y-2">
                {users.map((user) => (
                  <label
                    key={user.uid}
                    className="flex items-center gap-3 cursor-pointer p-2 hover:bg-secondary/30 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.uid)}
                      onChange={() => handleToggleUser(user.uid)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/20 p-6 bg-card space-y-3 sticky bottom-0">
          <Button onClick={handleSend} disabled={sending} className="w-full">
            <Send size={16} className="mr-2" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={sending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
