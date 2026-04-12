import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';

describe('App Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
      teardown: { destroyAfterEach: true }
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should navigate to Home component', async () => {
    const component = await harness.navigateByUrl('/home');

    expect(component).toBeInstanceOf(Home);
  });

  it('should redirect "" to Home component', async () => {
    const component = await harness.navigateByUrl('');

    expect(component).toBeInstanceOf(Home);
  });

  ['/unknown', '/angular', '/this/route/does/not/exists', '/hello'].forEach((url) => {
    it(`should navigate to NotFound component for "${url}" route`, async () => {
      const component = await harness.navigateByUrl(url);

      expect(component).toBeInstanceOf(NotFound);
    });
  });
});
