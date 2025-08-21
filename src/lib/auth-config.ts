import {
    GoogleAuthProvider,
    EmailAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    User
} from 'firebase/auth';
import { auth } from './firebase';

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure Email Auth Provider
export const emailProvider = new EmailAuthProvider();

// Authentication methods
export const authMethods = {
    // Email/Password authentication
    signInWithEmail: async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    },

    // Create account with email/password
    createAccountWithEmail: async (email: string, password: string) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    },

    // Google SSO authentication
    signInWithGoogle: async () => {
        return await signInWithPopup(auth, googleProvider);
    },

    // Sign out
    signOut: async () => {
        return await signOut(auth);
    },

    // Password reset
    resetPassword: async (email: string) => {
        return await sendPasswordResetEmail(auth, email);
    },

    // Update password
    updateUserPassword: async (user: User, newPassword: string) => {
        return await updatePassword(user, newPassword);
    }
};

// Password policy validation
export const passwordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,

    validate: (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < passwordPolicy.minLength) {
            errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
        }

        if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Account lockout configuration
export const lockoutPolicy = {
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,

    isAccountLocked: (loginAttempts: number, lockedUntil?: Date): boolean => {
        if (loginAttempts >= lockoutPolicy.maxFailedAttempts) {
            if (lockedUntil && new Date() < lockedUntil) {
                return true;
            }
        }
        return false;
    },

    calculateLockoutExpiry: (): Date => {
        const now = new Date();
        return new Date(now.getTime() + lockoutPolicy.lockoutDurationMinutes * 60 * 1000);
    }
};