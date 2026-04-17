import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

/**
 * Utility class to simplify interactions with Angular Material buttons
 * in component tests using Angular CDK Harnesses.
 */
export class MatButtonTesting {
  /**
   * Harness loader used to retrieve Angular Material harnesses.
   */
  private readonly harnessLoader: HarnessLoader;

  /**
   * Creates a new MatButtonTesting instance.
   *
   * @param loader HarnessLoader used to query component harnesses.
   */
  constructor(loader: HarnessLoader) {
    this.harnessLoader = loader;
  }

  /**
   * Retrieves a Material button harness matching the provided label.
   *
   * @param label Text or regular expression used to find the button.
   * @returns Promise resolving to the MatButtonHarness.
   */
  public async getMatButton(label: string | RegExp): Promise<MatButtonHarness> {
    return await this.harnessLoader.getHarness(MatButtonHarness.with({ text: label }));
  }

  /**
   * Checks whether a Material button matching the label exists.
   *
   * @param label Text or regular expression used to find the button.
   * @returns Promise resolving to true if the button exists, otherwise false.
   */
  public async exists(label: string | RegExp): Promise<boolean> {
    return (await this.harnessLoader.getHarnessOrNull(MatButtonHarness.with({ text: label }))) !== null;
  }

  /**
   * Checks whether the specified Material button is disabled.
   *
   * @param label Text or regular expression used to find the button.
   * @returns Promise resolving to true if the button is disabled.
   */
  public async isDisabled(label: string | RegExp): Promise<boolean> {
    const matButton = await this.getMatButton(label);
    const isDisabled = await matButton.isDisabled();

    return isDisabled;
  }

  /**
   * Clicks on the specified Material button.
   *
   * @param label Text or regular expression used to find the button.
   * @returns Promise that resolves once the click action is completed.
   */
  public async click(label: string | RegExp): Promise<void> {
    const matButton = await this.getMatButton(label);

    await matButton.click();
  }

  /**
   * Checks whether the specified Material button contains a descendant
   * element (e.g. `<mat-icon>`, Font Awesome `<i>`) with the given class.
   *
   * @param label Text or regular expression used to find the button.
   * @param icon Class applied to any descendant icon element used to identify the icon.
   * @returns Promise resolving to true if such an element is present, otherwise false.
   */
  public async hasIcon(label: string | RegExp, icon: string): Promise<boolean> {
    const matButton = await this.getMatButton(label);
    const host = await matButton.host();

    return host.matchesSelector(`:has(.${icon})`);
  }
}
