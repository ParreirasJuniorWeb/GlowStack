import type { User as FirebaseUser } from "firebase/auth";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
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

// suporte a login social (como Entrar com o Google)
// Login com o Google na GlowStack, utilizaremos o GoogleAuthProvider nativo do Firebase Auth

export const loginWithGoogleProvider = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // Opcional: Força o Google a pedir para selecionar a conta sempre
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const credentials = await signInWithPopup(auth, provider);

    // Sincroniza automaticamente os dados do Google com a sua coleção 'users' no Firestore
    await syncUserProfile(credentials.user);

    return credentials.user;
  } catch (error) {
    console.error("Erro ao autenticar com o Google:", error);
    throw error;
  }
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
export const resetUserPassword = async (email: string) => {
  if (!email || !email.trim()) {
    throw new Error('Por favor, informe um endereço de e-mail válido.');
  }

  const auth = getAuth();

  // Define o idioma do e-mail que o Firebase vai mandar para português do Brasil
  auth.languageCode = 'pt-br';

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error(
      "Erro ao efetuar o reset de senha por e-mail: ",
      error,
    );
    throw error;
  }
};
