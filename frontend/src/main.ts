// =============================================================
// FILE: main.ts
// PURPOSE: نقطة دخول التطبيق — بيشغل الـ AppComponent
// =============================================================

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig }             from './app/app.config';
import { AppComponent }          from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
