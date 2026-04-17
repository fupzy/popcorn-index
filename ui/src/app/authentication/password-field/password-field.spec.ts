import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MaterialTesting } from '@testing';

import { PasswordField } from './password-field';

@Component({
  imports: [ReactiveFormsModule, PasswordField],
  template: `
    <app-password-field
      [label]="label()"
      [control]="control"
      [autocomplete]="autocomplete()"
      [hidden]="hidden()"
      [showToggle]="showToggle()"
      [errors]="errors()"
      (visibilityToggle)="onToggle()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class HostComponent {
  public readonly label = signal('Password');
  public readonly autocomplete = signal('current-password');
  public readonly hidden = signal(true);
  public readonly showToggle = signal(true);
  public readonly errors = signal<Record<string, string>>({});
  public readonly toggleCount = signal(0);
  public readonly control = new FormControl('', { nonNullable: true });

  public onToggle(): void {
    this.toggleCount.update((count) => count + 1);
  }
}

describe('PasswordField', () => {
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
    const passwordField = fixture.debugElement.query(By.css('app-password-field'));

    expect(passwordField).not.toBeNull();
  });

  it('should render the provided label', async () => {
    host.label.set('My password');
    fixture.detectChanges();

    const exists = await materialTesting.matFormField.exists('My password');

    expect(exists).toEqual(true);
  });

  [
    { hidden: true, expectedType: 'password' },
    { hidden: false, expectedType: 'text' }
  ].forEach(({ hidden, expectedType }) => {
    it(`should render an input of type "${expectedType}" when hidden is ${hidden}`, async () => {
      host.hidden.set(hidden);
      fixture.detectChanges();

      const input = await materialTesting.matFormField.getMatInput('Password');

      expect(await input.getType()).toEqual(expectedType);
    });
  });

  [
    { hidden: true, expectedLabel: 'Show password' },
    { hidden: false, expectedLabel: 'Hide password' }
  ].forEach(({ hidden, expectedLabel }) => {
    it(`should label the toggle button "${expectedLabel}" when hidden is ${hidden}`, async () => {
      host.hidden.set(hidden);
      fixture.detectChanges();

      const toggle = await materialTesting.matIconButton.getMatIconButton('fa-solid');
      const toggleHost = await toggle.host();

      expect(await toggleHost.getAttribute('aria-label')).toEqual(expectedLabel);
    });
  });

  it('should not render the toggle button when showToggle is false', async () => {
    host.showToggle.set(false);
    fixture.detectChanges();

    const exists = await materialTesting.matIconButton.exists('fa-solid');

    expect(exists).toEqual(false);
  });

  it('should emit visibilityToggle when the toggle button is clicked', async () => {
    await materialTesting.matIconButton.click('fa-solid');
    await materialTesting.matIconButton.click('fa-solid');

    expect(host.toggleCount()).toEqual(2);
  });

  it('should reflect the FormControl value in the input', async () => {
    host.control.setValue('s3cret');
    fixture.detectChanges();

    const value = await materialTesting.matFormField.getMatInputValue('Password');

    expect(value).toEqual('s3cret');
  });

  it('should write user input back to the FormControl', async () => {
    await materialTesting.matFormField.setMatInputValue('Password', 'typed-value');

    expect(host.control.value).toEqual('typed-value');
  });

  it('should apply the autocomplete attribute to the input', () => {
    host.autocomplete.set('new-password');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[type="password"], input[type="text"]'));

    expect(input.nativeElement.getAttribute('autocomplete')).toEqual('new-password');
  });

  it('should render a mat-error when the control reports a matching error key', async () => {
    host.errors.set({ customError: 'Custom error message' });
    host.control.setErrors({ customError: true });
    host.control.markAsTouched();
    fixture.detectChanges();

    const errors = await materialTesting.matFormField.getErrors('Password');
    const errorText = await errors[0].getText();

    expect(errors).toHaveLength(1);
    expect(errorText).toContain('Custom error message');
  });

  it('should not render a mat-error for error keys that are not in the errors input', async () => {
    host.errors.set({ known: 'Known error' });
    host.control.setErrors({ unknown: true });
    host.control.markAsTouched();
    fixture.detectChanges();

    const errors = await materialTesting.matFormField.getErrors('Password');

    expect(errors).toHaveLength(0);
  });
});
