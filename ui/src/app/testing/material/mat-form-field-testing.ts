import { HarnessLoader } from '@angular/cdk/testing';
import { MatErrorHarness, MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatInputHarness } from '@angular/material/input/testing';

/**
 * Utility class to simplify interactions with Angular Material form fields
 * in component tests using Angular CDK Harnesses.
 */
export class MatFormFieldTesting {
  /**
   * Harness loader used to retrieve Angular Material harnesses.
   */
  private readonly harnessLoader: HarnessLoader;

  /**
   * Creates a new MatFormFieldTesting instance.
   *
   * @param loader HarnessLoader used to query component harnesses.
   */
  constructor(loader: HarnessLoader) {
    this.harnessLoader = loader;
  }

  /**
   * Retrieves a Material form field harness matching the provided label.
   *
   * @param label Text or regular expression used to find the form field by its floating label.
   * @returns Promise resolving to the MatFormFieldHarness.
   */
  public async getMatFormField(label: string | RegExp): Promise<MatFormFieldHarness> {
    return await this.harnessLoader.getHarness(MatFormFieldHarness.with({ floatingLabelText: label }));
  }

  /**
   * Checks whether a Material form field matching the label exists.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to true if the form field exists, otherwise false.
   */
  public async exists(label: string | RegExp): Promise<boolean> {
    return (await this.harnessLoader.getHarnessOrNull(MatFormFieldHarness.with({ floatingLabelText: label }))) !== null;
  }

  /**
   * Determines whether the specified form field is disabled.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to true if the form field is disabled.
   */
  public async isDisabled(label: string | RegExp): Promise<boolean> {
    const matFormField = await this.getMatFormField(label);
    const isDisabled = await matFormField.isDisabled();

    return isDisabled;
  }

  /**
   * Retrieves validation errors displayed in the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to an array of MatErrorHarness instances.
   */
  public async getErrors(label: string | RegExp): Promise<MatErrorHarness[]> {
    const matFormField = await this.getMatFormField(label);
    const erros = await matFormField.getErrors();

    return erros;
  }

  /**
   * Retrieves the MatInput harness associated with the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to the MatInputHarness.
   */
  public async getMatInput(label: string | RegExp): Promise<MatInputHarness> {
    const matFormField = await this.getMatFormField(label);
    const matInput = (await matFormField.getControl()) as MatInputHarness;

    return matInput;
  }

  /**
   * Retrieves the current value of the input inside the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to the input value.
   */
  public async getMatInputValue(label: string | RegExp): Promise<string> {
    const matFormField = await this.getMatFormField(label);
    const matInput = (await matFormField.getControl()) as MatInputHarness;
    const value = await matInput.getValue();

    return value;
  }

  /**
   * Sets the value of the input inside the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @param value Value to assign to the input. If undefined, an empty string is used.
   * @returns Promise that resolves once the value has been set.
   */
  public async setMatInputValue(label: string | RegExp, value?: string): Promise<void> {
    const matFormField = await this.getMatFormField(label);
    const matInput = (await matFormField.getControl()) as MatInputHarness;

    await matInput.setValue(value ?? '');
  }

  /**
   * Retrieves the MatSelect harness associated with the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to the MatSelectHarness.
   */
  public async getMatSelect(label: string | RegExp): Promise<MatSelectHarness> {
    const matFormField = await this.getMatFormField(label);
    const matSelect = (await matFormField.getControl()) as MatSelectHarness;

    return matSelect;
  }

  /**
   * Retrieves the currently selected value text from the select inside the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to the displayed selected value.
   */
  public async getMatSelectValue(label: string | RegExp): Promise<string> {
    const matSelect = await this.getMatSelect(label);
    const value = await matSelect.getValueText();

    return value;
  }

  /**
   * Selects an option in the select inside the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @param option Text of the option to select.
   * @returns Promise that resolves once the option has been selected.
   */
  public async setMatSelectValue(label: string | RegExp, option?: string): Promise<void> {
    const matSelect = await this.getMatSelect(label);

    await matSelect.open();
    await matSelect.clickOptions({ text: option });
  }

  /**
   * Opens the select dropdown inside the specified form field.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise that resolves once the select is opened.
   */
  public async openMatSelect(label: string | RegExp): Promise<void> {
    const matSelect = await this.getMatSelect(label);

    await matSelect.open();
  }

  /**
   * Retrieves the list of available option labels from the select inside the specified form field.
   *
   * The select is opened to fetch the options and then closed afterward.
   *
   * @param label Text or regular expression used to find the form field.
   * @returns Promise resolving to an array containing the option text values.
   */
  public async getMatSelectOptions(label: string | RegExp): Promise<string[]> {
    const matSelect = await this.getMatSelect(label);

    await matSelect.open();
    const options = await matSelect.getOptions();
    const values = await Promise.all(options.map(async (o) => await o.getText()));

    await matSelect.close();

    return values;
  }
}
