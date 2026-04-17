import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { MaterialTesting, provideRoutingTesting } from '@testing';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let materialTesting: MaterialTesting;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    materialTesting = new MaterialTesting(fixture);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the AuthFormShell and PasswordField subcomponents', () => {
    const shell = fixture.debugElement.query(By.css('app-auth-form-shell'));
    const passwordField = fixture.debugElement.query(By.css('app-password-field'));

    expect(shell).not.toBeNull();
    expect(passwordField).not.toBeNull();
  });

  ['Username', 'Password'].forEach((field) => {
    it(`should show a required error when the ${field.toLowerCase()} is empty`, async () => {
      await materialTesting.matFormField.setMatInputValue(field, 'something');
      await materialTesting.matFormField.setMatInputValue(field, '');
      (await materialTesting.matFormField.getMatInput(field)).blur();

      const errors = await materialTesting.matFormField.getErrors(field);
      const errorText = await errors[0].getText();

      expect(errorText).toContain('required');
    });
  });

  it('should POST the credentials and navigate to /home on success', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    await materialTesting.matFormField.setMatInputValue('Username', 'alice');
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');

    await materialTesting.matButton.click('Sign in');

    const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({ username: 'alice', password: 'secret-pw' });

    request.flush({ token: 'jwt-token' });

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  const errorResponseCases: {
    readonly description: string;
    readonly respond: (request: TestRequest) => void;
    readonly expectedMessage: string;
  }[] = [
    {
      description: 'should display an invalid credentials message when the server returns 401',
      respond: (request) => request.flush(null, { status: 401, statusText: 'Unauthorized' }),
      expectedMessage: 'Invalid username or password'
    },
    {
      description: 'should display a network error message when the server is unreachable',
      respond: (request) => request.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' }),
      expectedMessage: 'Unable to reach the server'
    },
    {
      description: 'should display a generic error message when the server returns an unexpected status',
      respond: (request) => request.flush('boom', { status: 500, statusText: 'Internal Server Error' }),
      expectedMessage: 'unexpected error'
    }
  ];

  errorResponseCases.forEach(({ description, respond, expectedMessage }) => {
    it(description, async () => {
      await materialTesting.matFormField.setMatInputValue('Username', 'alice');
      await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');

      await materialTesting.matButton.click('Sign in');

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
      respond(request);

      await fixture.whenStable();
      const alert = fixture.debugElement.query(By.css('[role="alert"]'));

      expect(alert).not.toBeNull();
      expect(alert.nativeElement.textContent).toContain(expectedMessage);
    });
  });

  it('should not submit a second time while a request is already in flight', async () => {
    await materialTesting.matFormField.setMatInputValue('Username', 'alice');
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');

    await materialTesting.matButton.click('Sign in');

    const firstRequest = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');

    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', {});

    httpTesting.expectNone('/popcorn-index/api/v1/authentication/login');

    firstRequest.flush({ token: 'jwt-token' });
  });
});
