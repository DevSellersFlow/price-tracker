import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyDZZAYTyTfukli9eapEuXlyp-Mxz-8gfs4',
  authDomain: 'price-tracker-sellersflow.firebaseapp.com',
  projectId: 'price-tracker-sellersflow',
  storageBucket: 'price-tracker-sellersflow.firebasestorage.app',
  messagingSenderId: '54394456463',
  appId: '1:54394456463:web:8e61216951bb81a82523fa',
}

export const app = initializeApp(firebaseConfig)
