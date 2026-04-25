import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { Login } from './authentication/login/login';
import { Register } from './authentication/register/register';
import { Search } from './search/search/search';

describe('App Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
      teardown: { destroyAfterEach: true }
    });

    harness = await RouterTestingHarness.create();
  });

  (
    [
      { url: '/home', expected: Home },
      { url: '', expected: Home },
      { url: '/search', expected: Search },
      { url: '/login', expected: Login },
      { url: '/register', expected: Register },
      { url: '/unknown', expected: NotFound },
      { url: '/angular', expected: NotFound },
      { url: '/this/route/does/not/exists', expected: NotFound },
      { url: '/hello', expected: NotFound }
    ] as const
  ).forEach(({ url, expected }) => {
    it(`should navigate to ${expected.name} component for "${url}" route`, async () => {
      const component = await harness.navigateByUrl(url);

      expect(component).toBeInstanceOf(expected);
    });
  });
});
