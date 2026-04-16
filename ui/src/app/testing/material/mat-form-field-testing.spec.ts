import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

import { MaterialTesting } from './material-testing';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatSelect, MatOption],
  template: `
    <mat-form-field>
      <mat-label>First label</mat-label>
      <input matInput [formControl]="control" />
    </mat-form-field>

    <mat-form-field>
      <mat-label>Error form field</mat-label>
      <input matInput [formControl]="controlWithErrors" />
      @if (controlWithErrors.errors) {
        <mat-error> Error occurred </mat-error>
      }
    </mat-form-field>

    <mat-form-field>
      <mat-label>Selector</mat-label>
      <mat-select [formControl]="selectControl">
        @for (option of options; track option) {
          <mat-option [value]="option">{{ option }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `
})
class TestComponent {
  public control = new FormControl<string | null>('Input value');
  public controlWithErrors = new FormControl<string | null>(null, Validators.required);
  public selectControl = new FormControl<string | null>('Option 1');

  protected options = ['Option 1', 'Option 2', 'Option 3'];
}

describe('MatFormFieldTesting', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let materialTesting: MaterialTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    materialTesting = new MaterialTesting(fixture);
  });

  it('should create a MatFormFieldTesting instance', () => {
    expect(materialTesting.matFormField).toBeTruthy();
  });

  it('should return the MatFormFieldHarness when using getMatIconButton', async () => {
    const matFormField = await materialTesting.matFormField.getMatFormField('First label');

    expect(matFormField).toBeTruthy();
  });

  it('should return true when using exists on an existing form field', async () => {
    const matFormFieldExists = await materialTesting.matFormField.exists('First label');

    expect(matFormFieldExists).toEqual(true);
  });

  it('should return false when using exists on a non existing form field', async () => {
    const matFormFieldExists = await materialTesting.matFormField.exists('non existing form field');

    expect(matFormFieldExists).toEqual(false);
  });

  it('should return false when using isDisabled on a non disabled form field', async () => {
    const isDisabled = await materialTesting.matFormField.isDisabled('First label');

    expect(isDisabled).toEqual(false);
  });

  it('should return true when using isDisabled on a disabled form field', async () => {
    component.control.disable();

    const isDisabled = await materialTesting.matFormField.isDisabled('First label');

    expect(isDisabled).toEqual(true);
  });

  it('should return the validation errors when using getErrors on a form field containing errors', async () => {
    component.controlWithErrors.markAsTouched();

    const errors = await materialTesting.matFormField.getErrors('Error form field');

    expect(errors.length).toEqual(1);

    const matError = errors[0];
    const error = await matError.getText();

    expect(error).toEqual('Error occurred');
  });

  it('should return the MatInputHarness when using getMatInput', async () => {
    const matInput = await materialTesting.matFormField.getMatInput('First label');

    expect(matInput).toBeTruthy();
  });

  it('should return the input value when using getMatInputValue', async () => {
    const matInputValue = await materialTesting.matFormField.getMatInputValue('First label');

    expect(matInputValue).toEqual('Input value');
  });

  it('should set the input value when using setMatInputValue', async () => {
    const matInputValueBeforeSetting = await materialTesting.matFormField.getMatInputValue('First label');
    expect(matInputValueBeforeSetting).toEqual('Input value');

    await materialTesting.matFormField.setMatInputValue('First label', 'New value');

    const matInputValueAfterSetting = await materialTesting.matFormField.getMatInputValue('First label');
    expect(matInputValueAfterSetting).toEqual('New value');
  });

  it('should set the input value to empty string when using setMatInputValue without providing a value', async () => {
    const matInputValueBeforeSetting = await materialTesting.matFormField.getMatInputValue('First label');
    expect(matInputValueBeforeSetting).toEqual('Input value');

    await materialTesting.matFormField.setMatInputValue('First label');

    const matInputValueAfterSetting = await materialTesting.matFormField.getMatInputValue('First label');
    expect(matInputValueAfterSetting).toEqual('');
  });

  it('should return the MatSelectHarness when using getMatSelect', async () => {
    const matSelect = await materialTesting.matFormField.getMatSelect('Selector');

    expect(matSelect).toBeTruthy();
  });

  it('should return the selected value when using getMatSelectValue', async () => {
    const matSelectValue = await materialTesting.matFormField.getMatSelectValue('Selector');

    expect(matSelectValue).toEqual('Option 1');
  });

  it('should selection the value when using setMatSelectValue', async () => {
    const matSelectValueBeforeSelecting = await materialTesting.matFormField.getMatSelectValue('Selector');
    expect(matSelectValueBeforeSelecting).toEqual('Option 1');

    await materialTesting.matFormField.setMatSelectValue('Selector', 'Option 3');

    const matSelectValueAfterSelecting = await materialTesting.matFormField.getMatSelectValue('Selector');
    expect(matSelectValueAfterSelecting).toEqual('Option 3');
  });

  it('should open the selector when using openMatSelect', async () => {
    await materialTesting.matFormField.openMatSelect('Selector');

    const matSelect = await materialTesting.matFormField.getMatSelect('Selector');
    const isOpen = await matSelect.isOpen();

    expect(isOpen).toEqual(true);
  });

  it('should return the available options when using getMatSelectOptions', async () => {
    const matSelectOptions = await materialTesting.matFormField.getMatSelectOptions('Selector');

    expect(matSelectOptions).toEqual(['Option 1', 'Option 2', 'Option 3']);
  });
});
