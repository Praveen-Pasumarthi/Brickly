# Gridly Mobile Build

Gridly is now set up for Android and iOS using Capacitor. Capacitor packages the existing canvas game into native Android and iOS projects while keeping the shared game code in `index.html`, `style.css`, and `js/`.

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
