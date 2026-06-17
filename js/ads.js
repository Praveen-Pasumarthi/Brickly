/**
 * Brickly - AdMob Ad Orchestrator (No Banners)
 * Manages Google AdMob Interstitial and Rewarded ads.
 * Falls back to clean browser-simulated prompts in desktop development mode.
 */

// ── MASTER SWITCH ── Set to true before publishing. Keeps ads fully disabled during dev/testing.
const ADS_ENABLED = true;
const PRODUCTION_MODE = true; // Set to true for production Google Play release, false for local testing

// ── PRODUCTION IDs ──
const ANDROID_INTERSTITIAL = 'ca-app-pub-1104715539013161/4805122197';
const ANDROID_REWARDED     = 'ca-app-pub-1104715539013161/7162702540';
// Future iOS production release IDs:
// const IOS_PRODUCTION_INTERSTITIAL = 'ca-app-pub-1104715539013161/9577112893';
// const IOS_PRODUCTION_REWARDED     = 'ca-app-pub-1104715539013161/4501869865';

// ── TEST IDs (active during development or when PRODUCTION_MODE is false) ──
const TEST_ANDROID_INTERSTITIAL = 'ca-app-pub-3940256099942544/1044939714';
const TEST_ANDROID_REWARDED     = 'ca-app-pub-3940256099942544/5224354917';
const IOS_INTERSTITIAL     = 'ca-app-pub-3940256099942544/4411468910';
const IOS_REWARDED         = 'ca-app-pub-3940256099942544/1712485313';

class AdManagerService {
    constructor() {
        this.initialized = false;
        this.isCapacitor = false;
        this.admobPlugin = null;
        this.platform = 'web';

        this.interstitialId = ANDROID_INTERSTITIAL;
        this.rewardedId = ANDROID_REWARDED;

        this.interstitialLoaded = false;
        this.rewardedLoaded = false;

        this.rewardSuccessCallback = null;
        this.rewardCloseCallback = null;
    }

    /**
     * Initializes AdMob and loads pre-requisite ads.
     */
    async initialize() {
        if (this.initialized) return;
        if (!ADS_ENABLED) { this.initialized = true; console.log('[Brickly Ads] Ads disabled.'); return; }

        // Resolve Capacitor and plugins dynamically at runtime instead of module evaluation time
        this.isCapacitor = !!(window.Capacitor && window.Capacitor.Plugins);
        this.admobPlugin = this.isCapacitor ? (window.Capacitor.Plugins.AdMob || null) : null;
        this.platform = this.isCapacitor ? window.Capacitor.getPlatform() : 'web';

        this.interstitialId = this.platform === 'ios' ? IOS_INTERSTITIAL : (PRODUCTION_MODE ? ANDROID_INTERSTITIAL : TEST_ANDROID_INTERSTITIAL);
        this.rewardedId = this.platform === 'ios' ? IOS_REWARDED : (PRODUCTION_MODE ? ANDROID_REWARDED : TEST_ANDROID_REWARDED);

        console.log(`[Brickly Ads] Initializing AdManager (Platform: ${this.platform})...`);

        if (this.admobPlugin) {
            try {
                // Initialize AdMob library
                await this.admobPlugin.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: !PRODUCTION_MODE,
                });
                this.initialized = true;
                console.log('[Brickly Ads] AdMob plugin initialized successfully.');

                // Setup listener for rewarded callbacks
                this.admobPlugin.addListener('onRewardedVideoAdReward', (reward) => {
                    console.log('[Brickly Ads] Reward granted:', reward);
                    if (this.rewardSuccessCallback) {
                        this.rewardSuccessCallback();
                        this.rewardSuccessCallback = null;
                    }
                    this.rewardCloseCallback = null; // Clear close callback so dismiss doesn't trigger game over
                });

                this.admobPlugin.addListener('onRewardedVideoAdDismissed', () => {
                    console.log('[Brickly Ads] Rewarded video ad dismissed.');
                    this.rewardedLoaded = false;
                    // Wait a moment before executing close handler in case onRewardedVideoAdReward fires slightly late
                    setTimeout(() => {
                        if (this.rewardCloseCallback) {
                            this.rewardCloseCallback();
                            this.rewardCloseCallback = null;
                        }
                        this.loadRewarded(); // Preload next one
                    }, 150);
                });

                this.admobPlugin.addListener('onRewardedVideoAdFailedToLoad', (err) => {
                    console.warn('[Brickly Ads] Rewarded video failed to load:', err);
                    this.rewardedLoaded = false;
                });

                this.admobPlugin.addListener('interstitialAdDismissed', () => {
                    console.log('[Brickly Ads] Interstitial ad dismissed.');
                    this.interstitialLoaded = false;
                    this.loadInterstitial(); // Preload next one
                });

                this.admobPlugin.addListener('interstitialAdFailedToLoad', (err) => {
                    console.warn('[Brickly Ads] Interstitial ad failed to load:', err);
                    this.interstitialLoaded = false;
                });

                // Pre-load initial ads
                this.loadInterstitial();
                this.loadRewarded();
            } catch (err) {
                console.error('[Brickly Ads] Failed to initialize AdMob native plugin:', err);
                this.initialized = false;
            }
        } else {
            this.initialized = true; // Simulated initialized state
            console.log('[Brickly Ads] AdMob native plugin unavailable. Running in simulated web browser mode.');
        }
    }

    /**
     * Preloads an interstitial ad in the background.
     */
    async loadInterstitial() {
        if (!ADS_ENABLED || !this.admobPlugin || !this.initialized) return;

        try {
            console.log('[Brickly Ads] Preloading interstitial...');
            await this.admobPlugin.prepareInterstitial({
                adId: this.interstitialId,
                isTesting: !PRODUCTION_MODE
            });
            this.interstitialLoaded = true;
            console.log('[Brickly Ads] Interstitial preloaded successfully.');
        } catch (err) {
            console.warn('[Brickly Ads] Failed to preload interstitial:', err);
            this.interstitialLoaded = false;
        }
    }

    /**
     * Shows the preloaded interstitial ad.
     */
    async showInterstitial() {
        if (!ADS_ENABLED) return;
        console.log('[Brickly Ads] Attempting to show interstitial...');

        if (this.admobPlugin) {
            if (!this.interstitialLoaded) {
                // Try to load it quickly first
                await this.loadInterstitial();
            }
            if (this.interstitialLoaded) {
                try {
                    await this.admobPlugin.showInterstitial();
                } catch (err) {
                    console.error('[Brickly Ads] Error displaying interstitial:', err);
                    this.loadInterstitial(); // Reload
                }
            } else {
                console.warn('[Brickly Ads] Interstitial not loaded, skipping.');
            }
        } else {
            console.log('[Brickly Ads] [Simulated] Playing Interstitial Ad...');
        }
    }

    /**
     * Preloads a rewarded ad in the background.
     */
    async loadRewarded() {
        if (!ADS_ENABLED || !this.admobPlugin || !this.initialized) return;

        try {
            console.log('[Brickly Ads] Preloading rewarded video...');
            await this.admobPlugin.prepareRewardVideoAd({
                adId: this.rewardedId,
                isTesting: !PRODUCTION_MODE
            });
            this.rewardedLoaded = true;
            console.log('[Brickly Ads] Rewarded video preloaded successfully.');
        } catch (err) {
            console.warn('[Brickly Ads] Failed to preload rewarded video:', err);
            this.rewardedLoaded = false;
        }
    }

    /**
     * Shows a rewarded ad. Fires callbacks on reward, dismissal, or failure.
     * @param {Function} onReward - Callback executed if the user finishes watching the ad and earns the reward.
     * @param {Function} onClose - Callback executed when the ad is closed or dismissed.
     * @param {Function} onFailure - Callback executed if the ad fails to load/show.
     */
    async showRewarded(onReward, onClose, onFailure) {
        if (!ADS_ENABLED) { if (onFailure) onFailure(new Error('Ads disabled.')); return; }
        console.log('[Brickly Ads] Attempting to show rewarded video...');
        this.rewardSuccessCallback = onReward;
        this.rewardCloseCallback = onClose;

        if (this.admobPlugin) {
            if (!this.rewardedLoaded) {
                console.log('[Brickly Ads] Rewarded video not preloaded. Attempting immediate load...');
                await this.loadRewarded();
            }

            if (this.rewardedLoaded) {
                try {
                    await this.admobPlugin.showRewardVideoAd();
                } catch (err) {
                    console.error('[Brickly Ads] Error showing rewarded video:', err);
                    this.rewardedLoaded = false;
                    this.loadRewarded();
                    if (onFailure) {
                        onFailure(err);
                    } else if (this.rewardCloseCallback) {
                        this.rewardCloseCallback();
                        this.rewardCloseCallback = null;
                    }
                }
            } else {
                console.warn('[Brickly Ads] Rewarded ad failed to load.');
                if (onFailure) {
                    onFailure(new Error('Ad failed to load. Check network or ad blocker.'));
                } else if (this.rewardCloseCallback) {
                    this.rewardCloseCallback();
                    this.rewardCloseCallback = null;
                }
            }
        } else {
            // Simulated browser modal for testing
            setTimeout(() => {
                const confirmed = confirm('🎮 [Simulated Ad]\n\nWatch this short 5-second video to revive your game and clear some space?\n\nClick OK to simulate viewing completion and earn your reward, or CANCEL to skip.');
                if (confirmed) {
                    console.log('[Brickly Ads] [Simulated] Reward earned!');
                    if (this.rewardSuccessCallback) {
                        this.rewardSuccessCallback();
                        this.rewardSuccessCallback = null;
                    }
                    this.rewardCloseCallback = null; // Clear so close handler isn't executed
                } else {
                    console.log('[Brickly Ads] [Simulated] Reward skipped.');
                }
                if (this.rewardCloseCallback) {
                    this.rewardCloseCallback();
                    this.rewardCloseCallback = null;
                }
            }, 100);
        }
    }
}

export const AdManager = new AdManagerService();
