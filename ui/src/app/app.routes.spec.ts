import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { Register } from './authentication/register/register';

describe('App Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
      teardown: { destroyAfterEach: true }
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should redirect "" to Home component', async () => {
    const component = await harness.navigateByUrl('');

    expect(component).toBeInstanceOf(Home);
  });

  (
    [
      { url: '/home', expected: Home },
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
