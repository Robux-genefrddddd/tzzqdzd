import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export type AuditAction =
  | "user_banned"
  | "user_unbanned"
  | "role_changed"
  | "ticket_resolved"
  | "ticket_assigned";

export interface AuditLog {
  id: string;
  action: AuditAction;
  performedBy: string; // Admin/Founder ID
  performedByName: string;
  targetUserId?: string;
  targetUserName?: string;
  reason?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AUDIT_COLLECTION = "audit_logs";

export async function logAction(
  action: AuditAction,
  performedBy: string,
  performedByName: string,
  targetUserId?: string,
  targetUserName?: string,
  reason?: string,
  details?: Record<string, any>,
): Promise<void> {
  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      action,
      performedBy,
      performedByName,
      targetUserId,
      targetUserName,
      reason,
      details,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error logging action:", error);
    throw error;
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy("timestamp", "desc"),
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    })) as AuditLog[];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

export async function getAuditLogsForUser(userId: string): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where("targetUserId", "==", userId),
      orderBy("timestamp", "desc"),
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    })) as AuditLog[];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

export async function banUser(
  adminId: string,
  adminName: string,
  userId: string,
  userName: string,
  reason: string,
): Promise<void> {
  try {
    const { updateUserProfile } = await import("./auth");

    // Update user ban status
    await updateUserProfile(userId, {
      isBanned: true,
      banReason: reason,
      banDate: new Date(),
    });

    // Log action
    await logAction(
      "user_banned",
      adminId,
      adminName,
      userId,
      userName,
      reason,
    );
  } catch (error) {
    console.error("Error banning user:", error);
    throw error;
  }
}

export async function unbanUser(
  adminId: string,
  adminName: string,
  userId: string,
  userName: string,
): Promise<void> {
  try {
    const { updateUserProfile } = await import("./auth");

    // Update user ban status
    await updateUserProfile(userId, {
      isBanned: false,
      banReason: undefined,
      banDate: undefined,
    });

    // Log action
    await logAction("user_unbanned", adminId, adminName, userId, userName);
  } catch (error) {
    console.error("Error unbanning user:", error);
    throw error;
  }
}
