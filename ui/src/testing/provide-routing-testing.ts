import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from '../app/app.routes';

export const provideRoutingTesting = (): EnvironmentProviders => {
  return makeEnvironmentProviders([provideRouter(routes)]);
};
