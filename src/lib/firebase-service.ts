import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { User, AuditLog, UserSession, AuditEventType } from '../types/auth';

// Collections references
export const collections = {
    users: collection(db, 'users'),
    auditLogs: collection(db, 'auditLogs'),
    userSessions: collection(db, 'userSessions')
};

// User document operations
export const userService = {
    // Get user document by UID
    async getUser(uid: string): Promise<User | null> {
        const userDoc = await getDoc(doc(collections.users, uid));
        return userDoc.exists() ? userDoc.data() as User : null;
    },

    // Create new user document
    async createUser(userData: Omit<User, 'uid'>): Promise<void> {
        await setDoc(doc(collections.users, userData.uid), {
            ...userData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    },

    // Update user document
    async updateUser(uid: string, updates: Partial<User>): Promise<void> {
        await updateDoc(doc(collections.users, uid), {
            ...updates,
            updatedAt: Timestamp.now()
        });
    },

    // Get users by role
    async getUsersByRole(role: string): Promise<User[]> {
        const q = query(
            collections.users,
            where('role', '==', role),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as User);
    }
};

// Audit logging operations
export const auditService = {
    // Create audit log entry
    async logEvent(eventData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
        await addDoc(collections.auditLogs, {
            ...eventData,
            timestamp: Timestamp.now()
        });
    },

    // Log authentication events
    async logAuthEvent(
        eventType: AuditEventType,
        userId: string,
        success: boolean,
        details: Record<string, any> = {},
        ipAddress: string = 'unknown',
        userAgent: string = 'unknown'
    ): Promise<void> {
        await this.logEvent({
            eventType,
            userId,
            success,
            details,
            ipAddress,
            userAgent
        });
    },

    // Get audit logs for user
    async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
        const q = query(
            collections.auditLogs,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.slice(0, limit).map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AuditLog));
    }
};

// Session management operations
export const sessionService = {
    // Create user session
    async createSession(sessionData: Omit<UserSession, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
        const docRef = await addDoc(collections.userSessions, {
            ...sessionData,
            createdAt: Timestamp.now(),
            lastActivity: Timestamp.now()
        });
        return docRef.id;
    },

    // Update session activity
    async updateSessionActivity(sessionId: string): Promise<void> {
        await updateDoc(doc(collections.userSessions, sessionId), {
            lastActivity: Timestamp.now()
        });
    },

    // End session
    async endSession(sessionId: string): Promise<void> {
        await updateDoc(doc(collections.userSessions, sessionId), {
            isActive: false
        });
    },

    // Get active sessions for user
    async getUserActiveSessions(userId: string): Promise<UserSession[]> {
        const q = query(
            collections.userSessions,
            where('userId', '==', userId),
            where('isActive', '==', true),
            orderBy('lastActivity', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserSession));
    }
};