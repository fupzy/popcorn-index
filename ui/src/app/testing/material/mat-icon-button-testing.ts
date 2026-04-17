import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

/**
 * Utility class to simplify interactions with Angular Material icon buttons
 * in component tests using Angular CDK Harnesses.
 *
 * This helper allows retrieving and interacting with `mat-icon-button`
 * elements based on a class applied to any descendant icon element
 * (`<mat-icon>`, Font Awesome `<i>`, ...) and optionally their CSS id.
 */
export class MatIconButtonTesting {
  /**
   * Harness loader used to retrieve Angular Material harnesses.
   */
  private readonly harnessLoader: HarnessLoader;

  /**
   * Creates a new MatIconButtonTesting instance.
   *
   * @param loader HarnessLoader used to query component harnesses.
   */
  constructor(loader: HarnessLoader) {
    this.harnessLoader = loader;
  }

  /**
   * Retrieves a Material icon button harness matching the specified icon and optional CSS id.
   *
   * The button is located using a CSS selector targeting a `mat-icon-button`
   * whose subtree contains an element with the provided icon class.
   *
   * @param icon Class applied to any descendant icon element (e.g. Material icon class or Font Awesome class) used to identify the button.
   * @param cssId Optional CSS id of the button element to further narrow the search.
   * @returns Promise resolving to the MatButtonHarness.
   */
  public async getMatIconButton(icon: string, cssId?: string): Promise<MatButtonHarness> {
    const idSelector = cssId ? `#${cssId}` : '';
    const selector = `button[mat-icon-button]${idSelector}:has(.${icon})`;

    return await this.harnessLoader.getHarness(MatButtonHarness.with({ selector: selector }));
  }

  /**
   * Checks whether a Material icon button matching the specified icon and optional CSS id exists.
   *
   * @param icon Class applied to any descendant icon element (e.g. Material icon class or Font Awesome class) used to identify the button.
   * @param cssId Optional CSS id of the button element.
   * @returns Promise resolving to true if the button exists, otherwise false.
   */
  public async exists(icon: string, cssId?: string): Promise<boolean> {
    const idSelector = cssId ? `#${cssId}` : '';
    const selector = `button[mat-icon-button]${idSelector}:has(.${icon})`;

    return (await this.harnessLoader.getHarnessOrNull(MatButtonHarness.with({ selector: selector }))) !== null;
  }

  /**
   * Determines whether the specified Material icon button is disabled.
   *
   * @param icon Class applied to any descendant icon element (e.g. Material icon class or Font Awesome class) used to identify the button.
   * @param cssId Optional CSS id of the button element.
   * @returns Promise resolving to true if the button is disabled.
   */
  public async isDisabled(icon: string, cssId?: string): Promise<boolean> {
    const matIconButton = await this.getMatIconButton(icon, cssId);
    const isDisabled = await matIconButton.isDisabled();

    return isDisabled;
  }

  /**
   * Clicks on the specified Material icon button.
   *
   * @param icon Class applied to any descendant icon element (e.g. Material icon class or Font Awesome class) used to identify the button.
   * @param cssId Optional CSS id of the button element.
   * @returns Promise that resolves once the click action has been completed.
   */
  public async click(icon: string, cssId?: string): Promise<void> {
    const matIconButton = await this.getMatIconButton(icon, cssId);

    await matIconButton.click();
  }
}
