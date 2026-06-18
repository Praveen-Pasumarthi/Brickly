# Brickly Mobile Build

Brickly is now set up for Android and iOS using Capacitor. Capacitor packages the existing canvas game into native Android and iOS projects while keeping the shared game code in `index.html`, `style.css`, and `js/`.

## First-time setup

Install dependencies:

```bash
npm install
```

Create native projects:

```bash
npm run cap:add:android
npm run cap:add:ios
```

Android can be built on Windows with Android Studio installed. iOS requires macOS with Xcode, or a cloud build service.

## Daily workflow

After changing game files, sync them into the native projects:

```bash
npm run cap:sync
```

Open Android Studio:

```bash
npm run android
```

Build a debug APK on this Windows machine:

```bash
npm run android:debug:windows
```

The Windows debug script uses Android Studio's bundled JDK 21. The system Java on this machine is Java 26, which is too new for the generated Gradle toolchain.

Open Xcode on macOS:

```bash
npm run ios
```

## Notes

- The generated mobile web bundle lives in `dist/`.
- Commit the generated `android/` and `ios/` folders once they are created.
- App icon and splash assets can be generated from `logo.png` in the next pass.

## Google Sign-In & Save Sync Guardrails (Checklist)

To prevent future Google login failures or score restoration bugs, always follow these rules when releasing updates:

### 1. Maintain OAuth Certificate Fingerprints (SHA-1)
Google Sign-in will fail silently or display a generic dialog if the app's signing signature is not registered in the Firebase console.
* **Keep all three SHA-1 fingerprints registered** under the Android app in Firebase settings:
  1. **Debug Keystore** (for local development on your machine).
  2. **Upload Key** (configured in your `build.gradle` signingConfigs).
  3. **App Signing Key** (found in the Google Play Console under *Setup -> App integrity*).
* If you move to a new development machine or regenerate certificates, you **must** obtain the new SHA-1, add it to Firebase Console, download the updated `google-services.json`, and run `npm run cap:sync`.

### 2. Do Not Enable Credential Manager for Google Sign-In
* In `js/firebase.js`, always keep `{ useCredentialManager: false }` inside the `signInWithGoogle` parameters. 
* Enabling this on newer Android devices runs into a known native bug (`NoCredentialException`) that blocks login. Leaving it as `false` forces the legacy picker, which is highly compatible.

### 3. Check Firestore Database Status & Rules
* If rules are modified, ensure the path for user data remains writable. The standard secure schema is:
  ```javascript
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
* Never put the database in locked mode (`allow read, write: if false;`), or database sync will fail with permission errors.

### 4. Release Checklist for Every Update
Before deploying any new version to the Play Store:
1. **Increment `versionCode`** by 1 in `android/app/build.gradle`.
2. Run `npm run cap:sync` to compile code and copy assets.
3. Test a **fresh install** on the emulator:
   * Uninstall the app first to wipe local storage.
   * Install the new build.
   * Sign in with Google and ensure it downloads/restores your previous settings and high scores.
   * Play a game, trigger a new high score, and verify it updates in the Firestore Console under the `users` collection.

