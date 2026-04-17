import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { MaterialTesting, provideRoutingTesting } from '@testing';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let materialTesting: MaterialTesting;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Register);
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
    const passwordFields = fixture.debugElement.queryAll(By.css('app-password-field'));

    expect(shell).not.toBeNull();
    expect(passwordFields).toHaveLength(2);
  });

  it('should toggle the password visibility when the toggle button is clicked', async () => {
    const passwordInput = await materialTesting.matFormField.getMatInput('Password');
    const confirmInput = await materialTesting.matFormField.getMatInput('Confirm password');

    expect(await passwordInput.getType()).toEqual('password');
    expect(await confirmInput.getType()).toEqual('password');

    await materialTesting.matIconButton.click('fa-solid');

    expect(await passwordInput.getType()).toEqual('text');
    expect(await confirmInput.getType()).toEqual('text');

    await materialTesting.matIconButton.click('fa-solid');

    expect(await passwordInput.getType()).toEqual('password');
    expect(await confirmInput.getType()).toEqual('password');
  });

  [
    { field: 'Username', value: 'ab', expectedError: 'at least 3 characters' },
    { field: 'Password', value: 'abc', expectedError: 'at least 6 characters' }
  ].forEach(({ field, value, expectedError }) => {
    it(`should show a minlength error when the ${field.toLowerCase()} is too short`, async () => {
      await materialTesting.matFormField.setMatInputValue(field, value);
      (await materialTesting.matFormField.getMatInput(field)).blur();

      const errors = await materialTesting.matFormField.getErrors(field);
      const errorText = await errors[0].getText();

      expect(errorText).toContain(expectedError);
    });
  });

  it('should show a mismatch error when the passwords do not match', async () => {
    await materialTesting.matFormField.setMatInputValue('Password', 'password123');
    await materialTesting.matFormField.setMatInputValue('Confirm password', 'different');
    (await materialTesting.matFormField.getMatInput('Confirm password')).blur();

    const errors = await materialTesting.matFormField.getErrors('Confirm password');
    const errorText = await errors[0].getText();

    expect(errorText).toContain('do not match');
  });

  it('should POST the credentials and navigate to /login on success', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    await materialTesting.matFormField.setMatInputValue('Username', 'alice');
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');
    await materialTesting.matFormField.setMatInputValue('Confirm password', 'secret-pw');

    await materialTesting.matButton.click('Sign up');

    const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({ username: 'alice', password: 'secret-pw' });

    request.flush(null);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  const errorResponseCases: {
    readonly description: string;
    readonly respond: (request: TestRequest) => void;
    readonly expectedMessage: string;
  }[] = [
    {
      description: 'should display a validation error message when the server returns 400',
      respond: (request) => request.flush({ errors: { Username: ['Username already taken'] } }, { status: 400, statusText: 'Bad Request' }),
      expectedMessage: 'Username already taken'
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
    },
    {
      description: 'should display a generic error message when the server returns 400 without validation details',
      respond: (request) => request.flush(null, { status: 400, statusText: 'Bad Request' }),
      expectedMessage: 'unexpected error'
    },
    {
      description: 'should display a generic error message when the server returns 400 with an empty error field',
      respond: (request) => request.flush({ errors: { Username: [] } }, { status: 400, statusText: 'Bad Request' }),
      expectedMessage: 'unexpected error'
    }
  ];

  errorResponseCases.forEach(({ description, respond, expectedMessage }) => {
    it(description, async () => {
      await materialTesting.matFormField.setMatInputValue('Username', 'alice');
      await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');
      await materialTesting.matFormField.setMatInputValue('Confirm password', 'secret-pw');

      await materialTesting.matButton.click('Sign up');

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');
      respond(request);

      await fixture.whenStable();
      const alert = fixture.debugElement.query(By.css('[role="alert"]'));

      expect(alert).not.toBeNull();
      expect(alert.nativeElement.textContent).toContain(expectedMessage);
    });
  });

  it('should clear the mismatch error when the user corrects the password field', async () => {
    await materialTesting.matFormField.setMatInputValue('Password', 'original-pw');
    await materialTesting.matFormField.setMatInputValue('Confirm password', 'secret-pw');
    (await materialTesting.matFormField.getMatInput('Confirm password')).blur();

    expect(await materialTesting.matFormField.getErrors('Confirm password')).toHaveLength(1);

    // Fixing the Password field does not re-run Confirm password's own validators,
    // so the cross-field validator is the one that clears the passwordMismatch flag.
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');

    expect(await materialTesting.matFormField.getErrors('Confirm password')).toHaveLength(0);
  });

  it('should not submit a second time while a request is already in flight', async () => {
    await materialTesting.matFormField.setMatInputValue('Username', 'alice');
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');
    await materialTesting.matFormField.setMatInputValue('Confirm password', 'secret-pw');

    await materialTesting.matButton.click('Sign up');

    const firstRequest = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');

    // Trigger submission a second time while the first request is pending. The form submission
    // should be a no-op: no additional HTTP request is issued.
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', {});

    httpTesting.expectNone('/popcorn-index/api/v1/authentication/register');

    firstRequest.flush(null);
  });
});
