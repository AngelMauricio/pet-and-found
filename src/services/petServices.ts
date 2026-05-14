import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PetReport } from "@/types";

/**
 * Service to handle pet reporting logic
 */
export const createPetReport = async (data: PetReport): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "pets"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    // Standard error handling for Senior architecture
    throw new Error("Failed to create pet report");
  }
};