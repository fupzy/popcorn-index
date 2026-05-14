import { HarnessLoader } from '@angular/cdk/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';

/**
 * Utility class to simplify interactions with Angular Material progress spinners
 * in component tests using Angular CDK Harnesses.
 */
export class MatProgressSpinnerTesting {
  /**
   * Harness loader used to retrieve Angular Material harnesses.
   */
  private readonly harnessLoader: HarnessLoader;

  /**
   * Creates a new MatProgressSpinnerTesting instance.
   *
   * @param loader HarnessLoader used to query component harnesses.
   */
  constructor(loader: HarnessLoader) {
    this.harnessLoader = loader;
  }

  /**
   * Retrieves the first Material progress spinner harness in the fixture.
   *
   * @returns Promise resolving to the MatProgressSpinnerHarness.
   */
  public async getMatProgressSpinner(): Promise<MatProgressSpinnerHarness> {
    return await this.harnessLoader.getHarness(MatProgressSpinnerHarness);
  }

  /**
   * Checks whether at least one Material progress spinner is present in the fixture.
   *
   * @returns Promise resolving to true if a spinner is present, otherwise false.
   */
  public async exists(): Promise<boolean> {
    return (await this.harnessLoader.getHarnessOrNull(MatProgressSpinnerHarness)) !== null;
  }
}
