import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDrt5MHhs-Wjoye8swLwLb068HC4kme-rg",
  authDomain: "absensionlinemuhika.firebaseapp.com",
  databaseURL: "https://absensionlinemuhika-default-rtdb.firebaseio.com",
  projectId: "absensionlinemuhika"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;