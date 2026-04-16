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

  it('should render the two form fields', async () => {
    const usernameExists = await materialTesting.matFormField.exists('Username');
    const passwordExists = await materialTesting.matFormField.exists('Password');

    expect(usernameExists).toEqual(true);
    expect(passwordExists).toEqual(true);
  });

  it('should render a disabled Sign in button when the form is empty', async () => {
    const isDisabled = await materialTesting.matButton.isDisabled('Sign in');

    expect(isDisabled).toEqual(true);
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

  it('should enable the Sign in button when the form is valid', async () => {
    await materialTesting.matFormField.setMatInputValue('Username', 'alice');
    await materialTesting.matFormField.setMatInputValue('Password', 'secret-pw');

    const isDisabled = await materialTesting.matButton.isDisabled('Sign in');

    expect(isDisabled).toEqual(false);
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

  it('should toggle the password input type when clicking the visibility button', () => {
    const queryInput = () => fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement as HTMLInputElement;
    const queryToggle = () => {
      const selector = 'button[aria-label="Show password"], button[aria-label="Hide password"]';
      return fixture.debugElement.query(By.css(selector)).nativeElement as HTMLButtonElement;
    };

    fixture.detectChanges();

    expect(queryInput().type).toEqual('password');
    expect(queryToggle().getAttribute('aria-label')).toEqual('Show password');

    queryToggle().click();
    fixture.detectChanges();

    expect(queryInput().type).toEqual('text');
    expect(queryToggle().getAttribute('aria-label')).toEqual('Hide password');

    queryToggle().click();
    fixture.detectChanges();

    expect(queryInput().type).toEqual('password');
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
