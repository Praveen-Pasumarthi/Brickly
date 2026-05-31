/**
 * Brickly - Local Storage Persistence Engine
 * Manages saving and loading high scores, game states (to resume play),
 * campaign levels, daily victory calendars, and user preferences.
 */

const STORAGE_KEYS = {
    HIGH_SCORE: 'brickly_high_score',
    HIGH_SCORE_10: 'brickly_high_score_10',
    HIGH_SCORE_CLASSIC: 'brickly_hs_classic',
    HIGH_SCORE_CLASSIC_10: 'brickly_hs_classic_10',
    HIGH_SCORE_ENDLESS: 'brickly_hs_endless',
    HIGH_SCORE_BLAST: 'brickly_hs_blast',
    CURRENT_STATE: 'brickly_save_state',
    DAILY_STREAK: 'brickly_daily_streak',
    DAILY_LAST_DATE: 'brickly_daily_last_date',
    ADVENTURE_PROGRESS: 'brickly_adventure_level',
    SETTINGS: 'brickly_settings'
};

import { Auth, DB } from './firebase.js';

export class StorageManager {
    /**
     * Checks if LocalStorage is available on the platform/webview.
     * @returns {boolean}
     */
    static isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Returns the LocalStorage key for a given game mode.
     */
    static _getModeKey(mode) {
        switch (mode) {
            case 'classic':   return STORAGE_KEYS.HIGH_SCORE_CLASSIC;
            case 'classic_10': return STORAGE_KEYS.HIGH_SCORE_CLASSIC_10;
            case 'endless':   return STORAGE_KEYS.HIGH_SCORE_ENDLESS;
            case 'blast':     return STORAGE_KEYS.HIGH_SCORE_BLAST;
            default:          return STORAGE_KEYS.HIGH_SCORE;
        }
    }

    /**
     * Updates and saves the high score if the new score is higher.
     * @param {number} score - Current score.
     * @param {string} mode - Active game mode.
     * @returns {number} The active high score.
     */
    static saveHighScore(score, mode = 'classic') {
        if (!this.isAvailable()) return score;
        const key = this._getModeKey(mode);
        const currentHigh = this.getHighScore(mode);
        if (score > currentHigh) {
            localStorage.setItem(key, score.toString());
            if (Auth.currentUser) {
                DB.saveHighScore(Auth.currentUser.uid, mode, score);
            }
            return score;
        }
        return currentHigh;
    }

    /**
     * Fetches the current high score for a specific mode.
     * @param {string} mode - Active game mode.
     * @returns {number}
     */
    static getHighScore(mode = 'classic') {
        if (!this.isAvailable()) return 0;
        const key = this._getModeKey(mode);
        const scoreStr = localStorage.getItem(key);
        return scoreStr ? parseInt(scoreStr, 10) : 0;
    }

    /**
     * Returns the highest score across all game modes.
     * @returns {number}
     */
    static getOverallHighScore() {
        if (!this.isAvailable()) return 0;
        return Math.max(
            this.getHighScore('classic'),
            this.getHighScore('classic_10'),
            this.getHighScore('endless'),
            this.getHighScore('blast')
        );
    }

    /**
     * One-time migration: copies old shared high scores into per-mode keys.
     * Old system used one key for classic+blast+endless, another for classic_10.
     * New system uses a separate key per mode.
     * Only migrates to classic (the original mode) — blast and endless start fresh.
     */
    static migrateOldHighScores() {
        if (!this.isAvailable()) return;
        if (localStorage.getItem('brickly_hs_migrated_v2') === 'true') return;

        // Clear all stale per-mode keys from old migration — all modes start fresh
        localStorage.removeItem(this._getModeKey('classic'));
        localStorage.removeItem(this._getModeKey('classic_10'));
        localStorage.removeItem(this._getModeKey('endless'));
        localStorage.removeItem(this._getModeKey('blast'));

        localStorage.setItem('brickly_hs_migrated_v2', 'true');
    }

    /**
     * Serializes and saves the active game board, tray slots, and scores for mid-game recovery.
     * @param {Object} state - Plain game state object.
     */
    static saveGameState(state) {
        if (!this.isAvailable()) return;
        try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save game state to LocalStorage:", e);
        }
    }

    /**
     * Restores a saved mid-game configuration.
     * @returns {Object|null}
     */
    static getGameState() {
        if (!this.isAvailable()) return null;
        try {
            const stateStr = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
            return stateStr ? JSON.parse(stateStr) : null;
        } catch (e) {
            console.error("Failed to load game state from LocalStorage:", e);
            return null;
        }
    }

    /**
     * Deletes the saved mid-game state (e.g. upon game over or level complete).
     */
    static clearGameState() {
        if (!this.isAvailable()) return;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STATE);
    }

    /**
     * Saves the player's progress in the Adventure Mode campaign.
     * @param {number} level - Highest completed level number + 1.
     */
    static saveAdventureProgress(level) {
        if (!this.isAvailable()) return;
        localStorage.setItem(STORAGE_KEYS.ADVENTURE_PROGRESS, level.toString());
        if (Auth.currentUser) {
            DB.saveProgress(Auth.currentUser.uid, level);
        }
    }

    /**
     * Fetches the player's highest unlocked Adventure level (defaults to 1).
     * @returns {number}
     */
    static getAdventureProgress() {
        if (!this.isAvailable()) return 1;
        const lvlStr = localStorage.getItem(STORAGE_KEYS.ADVENTURE_PROGRESS);
        return lvlStr ? parseInt(lvlStr, 10) : 1;
    }

    /**
     * Fetches the current Daily Challenge victory streak.
     * @returns {number}
     */
    static getDailyStreak() {
        if (!this.isAvailable()) return 0;
        const streakStr = localStorage.getItem(STORAGE_KEYS.DAILY_STREAK);
        return streakStr ? parseInt(streakStr, 10) : 0;
    }

    /**
     * One-time migration v2: re-maps old shared high scores into per-mode keys.
     * Old system: one shared key for classic+blast+endless, one for classic_10.
     * New system: separate key per mode.
     * Strategy: migrate old shared score to Classic only (where it was earned),
     * old classic_10 to Classic XL only. Blast and Endless start fresh.
     */
    static migrateOldHighScores() {
        if (!this.isAvailable()) return;
        if (localStorage.getItem('brickly_hs_migrated_v2') === 'true') return;

        const oldShared = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
        const oldClassic10 = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE_10);

        // Migrate old shared score → Classic only
        if (oldShared) {
            const val = parseInt(oldShared, 10) || 0;
            if (val > 0) {
                const key = this._getModeKey('classic');
                const existing = parseInt(localStorage.getItem(key), 10) || 0;
                if (val > existing) {
                    localStorage.setItem(key, val.toString());
                }
            }
        }

        // Migrate old classic_10 score → Classic XL only
        if (oldClassic10) {
            const val = parseInt(oldClassic10, 10) || 0;
            if (val > 0) {
                const key = this._getModeKey('classic_10');
                const existing = parseInt(localStorage.getItem(key), 10) || 0;
                if (val > existing) {
                    localStorage.setItem(key, val.toString());
                }
            }
        }

        // Clear stale Blast/Endless keys (if populated by old v1 migration)
        localStorage.removeItem(this._getModeKey('endless'));
        localStorage.removeItem(this._getModeKey('blast'));

        localStorage.setItem('brickly_hs_migrated_v2', 'true');
    }

    /**
     * Records a Daily Challenge completion, calculating consecutive streaks.
     * @param {string} dateStr - Date string, format: 'YYYY-MM-DD'.
     * @returns {number} The updated daily streak.
     */
    static recordDailyCompletion(dateStr) {
        if (!this.isAvailable()) return 0;
        const lastDateStr = this.getDailyLastCompletedDate();
        let currentStreak = this.getDailyStreak();

        if (lastDateStr === dateStr) {
            // Already recorded today, ignore
            return currentStreak;
        }

        if (lastDateStr) {
            // Parse strings as UTC midnights to calculate absolute day difference
            const lastDate = new Date(lastDateStr + 'T00:00:00Z');
            const currentDate = new Date(dateStr + 'T00:00:00Z');
            const timeDiff = currentDate.getTime() - lastDate.getTime();
            const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                currentStreak += 1;
            } else if (dayDiff > 1) {
                currentStreak = 1; // Streak broken, reset to 1
            }
        } else {
            currentStreak = 1; // First daily completion
        }

        localStorage.setItem(STORAGE_KEYS.DAILY_STREAK, currentStreak.toString());
        localStorage.setItem(STORAGE_KEYS.DAILY_LAST_DATE, dateStr);
        return currentStreak;
    }

    /**
     * Saves application-wide user settings (themes, sound, music, vibration toggles).
     * @param {Object} settings
     */
    static saveSettings(settings) {
        if (!this.isAvailable()) return;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        if (Auth.currentUser) {
            DB.saveSettings(Auth.currentUser.uid, settings);
        }
    }

    /**
     * Fetches saved settings, returning defaults if not found.
     * @returns {Object}
     */
    static getSettings() {
        const defaultSettings = { sfx: true, bgm: true, vibration: true, theme: 'neon', menuTheme: 'royal', sfxVolume: 80, bgmVolume: 50 };
        if (!this.isAvailable()) return defaultSettings;
        try {
            const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return settingsStr ? { ...defaultSettings, ...JSON.parse(settingsStr) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }
}
