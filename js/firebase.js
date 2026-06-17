// js/firebase.js

// Safe access to Capacitor plugins (avoids bare imports breaking Vanilla JS)
const getFirebaseAuth = () => window.Capacitor?.Plugins?.FirebaseAuthentication;
const getFirebaseFirestore = () => window.Capacitor?.Plugins?.FirebaseFirestore;

class FirebaseAuthService {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        this.init();
    }

    async init() {
        const AuthPlugin = getFirebaseAuth();
        if (!AuthPlugin) {
            console.warn("FirebaseAuthentication plugin not available (Native only).");
            return;
        }

        AuthPlugin.addListener('authStateChange', (result) => {
            this.currentUser = result.user || null;
            this.listeners.forEach(cb => cb(this.currentUser));
        });
        
        try {
            const result = await AuthPlugin.getCurrentUser();
            this.currentUser = result.user || null;
            this.listeners.forEach(cb => cb(this.currentUser));
        } catch (e) {
            console.error('Failed to fetch initial Firebase auth state', e);
        }
    }

    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        if (this.currentUser !== undefined) {
            callback(this.currentUser);
        }
    }

    async signInWithGoogle() {
        const AuthPlugin = getFirebaseAuth();
        if (!AuthPlugin) {
            alert("Google Sign-In is only available on the native mobile app!");
            throw new Error("Auth plugin missing");
        }
        try {
            const result = await AuthPlugin.signInWithGoogle({
                useCredentialManager: false
            });
            return result.user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    }

    async signOut() {
        const AuthPlugin = getFirebaseAuth();
        if (!AuthPlugin) return;
        try {
            await AuthPlugin.signOut();
        } catch (error) {
            console.error("Sign-Out Error:", error);
            throw error;
        }
    }
}

class FirestoreService {
    constructor() {}

    async saveSettings(uid, settings) {
        if (!uid) return;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return;
        try {
            await DBPlugin.setDocument({
                reference: `users/${uid}/settings/data`,
                data: settings,
                merge: true
            });
        } catch (e) {
            console.error('Firestore save settings error', e);
        }
    }

    async saveProgress(uid, level) {
        if (!uid) return;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return;
        try {
            await DBPlugin.setDocument({
                reference: `users/${uid}/progress/data`,
                data: { unlockedLevel: level, lastUpdated: Date.now() },
                merge: true
            });
        } catch (e) {
            console.error('Firestore save progress error', e);
        }
    }

    async saveHighScore(uid, mode, score) {
        if (!uid) return;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return;
        try {
            await DBPlugin.setDocument({
                reference: `users/${uid}/highScores/${mode}`,
                data: { score, timestamp: Date.now() },
                merge: true
            });
        } catch (e) {
            console.error('Firestore save highscore error', e);
        }
    }

    async getSettings(uid) {
        if (!uid) return null;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return null;
        try {
            const { snapshot } = await DBPlugin.getDocument({
                reference: `users/${uid}/settings/data`
            });
            return snapshot.data || null;
        } catch (e) {
            return null;
        }
    }
    
    async getProgress(uid) {
        if (!uid) return null;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return null;
        try {
            const { snapshot } = await DBPlugin.getDocument({
                reference: `users/${uid}/progress/data`
            });
            return snapshot.data ? snapshot.data.unlockedLevel : null;
        } catch (e) {
            return null;
        }
    }

    async getHighScores(uid) {
        if (!uid) return null;
        const DBPlugin = getFirebaseFirestore();
        if (!DBPlugin) return null;
        try {
            const { snapshots } = await DBPlugin.getCollection({
                reference: `users/${uid}/highScores`
            });
            const scores = {};
            snapshots.forEach(doc => {
                scores[doc.id] = doc.data.score;
            });
            return scores;
        } catch (e) {
            return null;
        }
    }
}

export const Auth = new FirebaseAuthService();
export const DB = new FirestoreService();
