import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MaterialTesting } from '@testing';

import { AuthFormShell } from './auth-form-shell';

@Component({
  imports: [ReactiveFormsModule, AuthFormShell],
  template: `
    <app-auth-form-shell
      [form]="form"
      [title]="title()"
      [submitLabel]="submitLabel()"
      [submitIcon]="submitIcon()"
      [submitDisabled]="submitDisabled()"
      [isSubmitting]="isSubmitting()"
      [errorMessage]="errorMessage()"
      (formSubmit)="onSubmit()">
      <p>Projected</p>
    </app-auth-form-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class HostComponent {
  public readonly title = signal('Sign in');
  public readonly submitLabel = signal('Submit');
  public readonly submitIcon = signal('fa-right-to-bracket');
  public readonly submitDisabled = signal(false);
  public readonly isSubmitting = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly submitCount = signal(0);
  public readonly form: FormGroup;

  constructor() {
    const formBuilder = new FormBuilder();
    this.form = formBuilder.nonNullable.group({
      username: ['', [Validators.required]]
    });
  }

  public onSubmit(): void {
    this.submitCount.update((count) => count + 1);
  }
}

describe('AuthFormShell', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let materialTesting: MaterialTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    materialTesting = new MaterialTesting(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    const shell = fixture.debugElement.query(By.css('app-auth-form-shell'));

    expect(shell).not.toBeNull();
  });

  it('should render the provided title', () => {
    host.title.set('Create your account');
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h2'));

    expect(heading.nativeElement.textContent.trim()).toEqual('Create your account');
  });

  it('should render the submit button with the provided label', async () => {
    host.submitLabel.set('Sign up');
    fixture.detectChanges();

    const exists = await materialTesting.matButton.exists('Sign up');

    expect(exists).toEqual(true);
  });

  it('should render the provided icon when not submitting', async () => {
    host.submitIcon.set('fa-user-plus');
    fixture.detectChanges();

    expect(await materialTesting.matButton.hasIcon('Submit', 'fa-user-plus')).toEqual(true);
    expect(await materialTesting.matButton.hasIcon('Submit', 'fa-spinner')).toEqual(false);
  });

  it('should render the spinner icon when isSubmitting is true', async () => {
    host.isSubmitting.set(true);
    fixture.detectChanges();

    expect(await materialTesting.matButton.hasIcon('Submit', 'fa-spinner')).toEqual(true);
    expect(await materialTesting.matButton.hasIcon('Submit', 'fa-spin')).toEqual(true);
  });

  [
    { submitDisabled: true, isSubmitting: false, expectedDisabled: true, label: 'submitDisabled is true' },
    { submitDisabled: false, isSubmitting: true, expectedDisabled: true, label: 'isSubmitting is true' },
    { submitDisabled: false, isSubmitting: false, expectedDisabled: false, label: 'neither flag is set' }
  ].forEach(({ submitDisabled, isSubmitting, expectedDisabled, label }) => {
    it(`should ${expectedDisabled ? 'disable' : 'enable'} the submit button when ${label}`, async () => {
      host.submitDisabled.set(submitDisabled);
      host.isSubmitting.set(isSubmitting);
      fixture.detectChanges();

      const disabled = await materialTesting.matButton.isDisabled('Submit');

      expect(disabled).toEqual(expectedDisabled);
    });
  });

  it('should not render the error alert when errorMessage is null', () => {
    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert).toBeNull();
  });

  it('should render the error alert when errorMessage is set', () => {
    host.errorMessage.set('Something went wrong.');
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert).not.toBeNull();
    expect(alert.nativeElement.textContent).toContain('Something went wrong.');
  });

  it('should emit formSubmit when the form is submitted', () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', {});

    expect(host.submitCount()).toEqual(1);
  });

  it('should emit formSubmit when the submit button is clicked', async () => {
    await materialTesting.matButton.click('Submit');

    expect(host.submitCount()).toEqual(1);
  });

  it('should project content inside the form', () => {
    const form = fixture.debugElement.query(By.css('form'));
    const projected = form.query(By.css('p'));

    expect(projected).not.toBeNull();
    expect(projected.nativeElement.textContent).toEqual('Projected');
  });

  it('should bind the provided FormGroup to the form element', () => {
    const form = fixture.debugElement.query(By.css('form'));
    const directive = form.injector.get(FormGroupDirective);

    expect(directive.form).toBe(host.form);
  });
});
