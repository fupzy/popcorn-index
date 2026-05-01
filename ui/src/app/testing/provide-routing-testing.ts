import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from '../app.routes';

export const provideRoutingTesting = (): EnvironmentProviders => {
  return makeEnvironmentProviders([provideRouter(routes, withComponentInputBinding())]);
};
