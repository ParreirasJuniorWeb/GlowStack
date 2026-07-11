import { db } from "./firebaseConnection.ts"
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore"
import type { User } from "firebase/auth"
import type { UserProfile } from "../types/glowstack.ts.ts"

export const createUserProfile = async (user: User, name: string, stripeCustomerId: string): Promise<void> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    name,
    email: user.email || '',
    stripeCustomerId,
    createdAt: Timestamp.now(),
  };
    try {
    const usersCollectionRef = collection(db, 'users');
    await addDoc(usersCollectionRef, userProfile);
  }
    catch (error) {
    console.error('Erro ao criar o perfil do usuário:', error);
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const userProfileDoc = querySnapshot.docs.find(doc => doc.data().uid === uid);
    return userProfileDoc ? (userProfileDoc.data() as UserProfile) : null;
  }
    catch (error) {
    console.error('Erro ao buscar o perfil do usuário:', error);
    return null;
  }
}