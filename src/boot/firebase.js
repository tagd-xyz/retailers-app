// import { boot } from 'quasar/wrappers'
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import { useAuthStore } from 'stores/auth';
const store = useAuthStore();

// TODO: User .env
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

async function refreshToken(user) {
  const token = await user.getIdToken();
  store.setToken(token);
}

async function checkClaims(user) {
  const { claims } = await user.getIdTokenResult(true);
  return claims.enabled ?? false;
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    // user is logged
    const isEnabled = await checkClaims(user);
    store.signIn(user, isEnabled);

    // update token now and later
    refreshToken(user);
    store.setInterval(
      setInterval(() => {
        refreshToken(user);
      }, 15 * 60 * 1000) // 15 minutes
    );
  } else {
    // user is logged out
    store.signOut();
  }
});

const authUI = new firebaseui.auth.AuthUI(auth);

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
// export default boot(async (/* { app, router, ... } */) => {
//   // something to do
// })

export { auth, authUI };
