import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MaterialTesting, provideRoutingTesting } from '@testing';

import { AUTH_TOKEN_STORAGE_KEY, AuthenticationService } from '../authentication/authentication.service';

import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let materialTesting: MaterialTesting;
  let router: Router;
  let authenticationService: AuthenticationService;

  const createFixture = (): void => {
    router = TestBed.inject(Router);
    authenticationService = TestBed.inject(AuthenticationService);

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    materialTesting = new MaterialTesting(fixture);
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [Menu],
      providers: [provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    createFixture();

    expect(component).toBeTruthy();
  });

  [
    {
      label: 'Home',
      route: '/home'
    },
    {
      label: 'Search',
      route: '/search'
    }
  ].forEach((item) => {
    it('should render a Home button', async () => {
      createFixture();

      const buttonExists = await materialTesting.matButton.exists(item.label);

      expect(buttonExists).toBeTruthy();
    });

    it('should navigate to /home when clicking on the Home button', async () => {
      createFixture();

      await materialTesting.matButton.click(item.label);

      expect(router.url).toEqual(item.route);
    });
  });

  describe('when no token is stored', () => {
    beforeEach(() => {
      createFixture();
    });

    it('should render a Login button', async () => {
      expect(await materialTesting.matButton.exists('Login')).toEqual(true);
      expect(await materialTesting.matButton.exists('Logout')).toEqual(false);
    });

    it('should navigate to /login when clicking on the Login button', async () => {
      await materialTesting.matButton.click('Login');

      expect(router.url).toEqual('/login');
    });
  });

  describe('when a token is stored', () => {
    beforeEach(() => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'jwt-token');
      createFixture();
    });

    it('should render a Logout button', async () => {
      expect(await materialTesting.matButton.exists('Logout')).toEqual(true);
      expect(await materialTesting.matButton.exists('Login')).toEqual(false);
    });

    it('should clear the token and navigate to /home when clicking on the Logout button', async () => {
      await materialTesting.matButton.click('Logout');

      expect(authenticationService.getToken()).toBeNull();
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      expect(router.url).toEqual('/home');
    });

    it('should swap the Logout button for a Login button after logging out', async () => {
      await materialTesting.matButton.click('Logout');
      fixture.detectChanges();

      expect(await materialTesting.matButton.exists('Login')).toEqual(true);
      expect(await materialTesting.matButton.exists('Logout')).toEqual(false);
    });
  });
});
