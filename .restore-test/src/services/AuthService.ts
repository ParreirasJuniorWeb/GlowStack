import type { User as FirebaseUser } from "firebase/auth";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConnection";
import type { UserProfile } from "../types/glowstack.ts";

// Salva ou atualiza os metadados do usuário no Firestore
export const syncUserProfile = async (
  user: FirebaseUser,
  additionalData?: { name: string },
): Promise<UserProfile> => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      name: additionalData?.name || user.displayName || "Usuário GlowStack",
      email: user.email || "",
      stripeCustomerId: "", // Será preenchido pela Cloud Function integrada ao Stripe futuramente
      createdAt: Timestamp.now(),
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return userSnap.data() as UserProfile;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const auth = getAuth();
  const credentials = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    pass,
  );
  return credentials.user;
};

export const registerWithEmail = async (
  email: string,
  pass: string,
  name: string,
) => {
  const auth = getAuth();
  const credentials = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    pass,
  );

  // Atualiza o perfil nativo do Firebase Auth com o nome informado
  await updateProfile(credentials.user, { displayName: name.trim() });

  // Cria o documento do usuário na coleção 'users' do Firestore
  await syncUserProfile(credentials.user, { name: name.trim() });

  return credentials.user;
};

// Reset de senha da conta do usuário
export const resetPassword = async (email: string) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error(
      "Erro ao efetuar o reset de senha por e-mail (e-mail não encontrado na base de dados do Firebase):",
      error,
    );
  }
};
