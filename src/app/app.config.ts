import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

// Якщо файл app.routes.ts існує - імпортуй його, якщо ні - залиш пустий масив []
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
};
