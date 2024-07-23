import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"danotes-661f2","appId":"1:693891937237:web:ff1dc4c05fbacc1e6c435c","storageBucket":"danotes-661f2.appspot.com","apiKey":"AIzaSyBTBljEVRIaFhztF4XQjbJzlbK7guYaUpU","authDomain":"danotes-661f2.firebaseapp.com","messagingSenderId":"693891937237"}))), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
