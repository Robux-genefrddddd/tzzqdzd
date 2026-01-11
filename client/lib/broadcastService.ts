import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export interface BroadcastMessage {
  id: string;
  senderId: string;
  senderName: string;
  title: string;
  message: string;
  recipientType: "all" | "specific";
  recipientIds?: string[];
  recipientRoles?: string[];
  createdAt: Date;
  readBy?: string[];
}

const BROADCAST_COLLECTION = "broadcast_messages";

// Send broadcast message
export async function sendBroadcastMessage(
  senderId: string,
  senderName: string,
  title: string,
  message: string,
  recipientType: "all" | "specific",
  recipientIds?: string[],
  recipientRoles?: string[],
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, BROADCAST_COLLECTION), {
      senderId,
      senderName,
      title,
      message,
      recipientType,
      recipientIds: recipientIds || [],
      recipientRoles: recipientRoles || [],
      createdAt: Timestamp.now(),
      readBy: [],
    });

    return docRef.id;
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    throw error;
  }
}

// Get all broadcast messages (for admin)
export async function getAllBroadcastMessages(): Promise<BroadcastMessage[]> {
  try {
    const q = query(
      collection(db, BROADCAST_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as BroadcastMessage[];

    return messages;
  } catch (error) {
    console.error("Error fetching broadcast messages:", error);
    return [];
  }
}

// Get broadcast messages for a specific user
export async function getUserBroadcastMessages(userId: string): Promise<BroadcastMessage[]> {
  try {
    const q = query(
      collection(db, BROADCAST_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as BroadcastMessage[];

    return messages.filter((msg) => {
      // Include if sent to all users or sent to this specific user
      if (msg.recipientType === "all") {
        return true;
      }
      return msg.recipientIds?.includes(userId) || false;
    });
  } catch (error) {
    console.error("Error fetching user broadcast messages:", error);
    return [];
  }
}

// Delete broadcast message (founder only)
export async function deleteBroadcastMessage(messageId: string): Promise<void> {
  try {
    const docRef = doc(db, BROADCAST_COLLECTION, messageId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting broadcast message:", error);
    throw error;
  }
}

// Mark message as read
export async function markBroadcastMessageAsRead(
  messageId: string,
  userId: string,
): Promise<void> {
  try {
    const docRef = doc(db, BROADCAST_COLLECTION, messageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const readBy = docSnap.data().readBy || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        await updateDoc(docRef, { readBy });
      }
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}
