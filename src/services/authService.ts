import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser as firebaseDeleteUser
} from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from '@/i18n/routing';

export const loginUser = async (email: string, pass: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const registerUser = async (email: string, pass: string, name: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

        await updateProfile(userCredential.user, {
            displayName: name,
        });

        return userCredential.user;
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const updateUserProfile = async (name: string) => {
    if (!auth.currentUser) throw new Error("no-user");
    try {
        await updateProfile(auth.currentUser, {
            displayName: name
        });
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const updateUserPassword = async (currentPass: string, newPass: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("no-user");

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPass);
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const deleteUserAccount = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("no-user");

    try {
        await deleteDoc(doc(db, "users", user.uid));
        await firebaseDeleteUser(user);
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const reauthenticateAndDelete = async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("no-user");

    try {
        const credential = EmailAuthProvider.credential(user.email, password);

        await reauthenticateWithCredential(user, credential);

        await deleteDoc(doc(db, "users", user.uid));

        await firebaseDeleteUser(user);
    } catch (error: any) {
        throw new Error(error.code);
    }
};

export const logout = () => {
    const router = useRouter();

    signOut(auth);
    router.replace('/');
}