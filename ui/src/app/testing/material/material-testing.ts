import { ComponentFixture } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { MatButtonTesting } from './mat-button-testing';
import { MatIconButtonTesting } from './mat-icon-button-testing';
import { MatFormFieldTesting } from './mat-form-field-testing';

/**
 * Centralized helper providing convenient access to Angular Material
 * testing utilities based on CDK Harnesses.
 *
 * This class instantiates and exposes specialized helpers for interacting
 * with common Angular Material components during component tests.
 *
 * @typeParam T Type of the component associated with the fixture.
 *
 * @example
 * ```ts
 * const materialTesting = new MaterialTesting(fixture);
 *
 * await materialTesting.matButton.click('Save');
 * ```
 */
export class MaterialTesting<T = unknown> {
  /**
   * Helper used to interact with Angular Material form fields.
   */
  public readonly matFormField: MatFormFieldTesting;

  /**
   * Helper used to interact with Angular Material buttons.
   */
  public readonly matButton: MatButtonTesting;

  /**
   * Helper used to interact with Angular Material icon buttons.
   */
  public readonly matIconButton: MatIconButtonTesting;

  /**
   * Creates a new MaterialTesting instance and initializes
   * all Material testing helpers using the provided fixture.
   *
   * Internally, a CDK HarnessLoader is created using
   * TestbedHarnessEnvironment.
   *
   * @param fixture Angular ComponentFixture used to create the harness loader.
   */
  constructor(fixture: ComponentFixture<T>) {
    const loader = TestbedHarnessEnvironment.loader(fixture);

    this.matFormField = new MatFormFieldTesting(loader);
    this.matButton = new MatButtonTesting(loader);
    this.matIconButton = new MatIconButtonTesting(loader);
  }
}
