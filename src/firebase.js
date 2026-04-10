import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBcml1DFaG3ihFdgagNMGnYi697UpbZA4U",
  authDomain: "pizzarap-admin.firebaseapp.com",
  databaseURL: "https://pizzarap-admin-default-rtdb.firebaseio.com",
  projectId: "pizzarap-admin",
  storageBucket: "pizzarap-admin.firebasestorage.app",
  messagingSenderId: "82054691113",
  appId: "1:82054691113:web:b84f786cb4cf8207dc1f38",
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export function onAvailabilityChange(callback) {
  const availRef = ref(db, 'availability')
  return onValue(availRef, (snapshot) => {
    callback(snapshot.val() || {})
  })
}

export function setProductAvailability(productId, available) {
  return set(ref(db, `availability/${productId}`), available)
}
