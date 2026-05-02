import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';

import { LoadingShell } from './loading-shell';

@Component({
  imports: [LoadingShell],
  template: `
    <app-loading-shell [isLoading]="isLoading()" [errorMessage]="errorMessage()">
      <div class="projected">Custom content</div>
    </app-loading-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHost {
  public readonly isLoading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
}

describe('LoadingShell', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  (
    [
      { name: 'when only loading', isLoading: true, errorMessage: null, expectSpinner: true, expectAlert: false, expectContent: false },
      { name: 'when only error', isLoading: false, errorMessage: 'Boom', expectSpinner: false, expectAlert: true, expectContent: false },
      { name: 'when neither loading nor error', isLoading: false, errorMessage: null, expectSpinner: false, expectAlert: false, expectContent: true },
      {
        name: 'when both loading and error (loading wins)',
        isLoading: true,
        errorMessage: 'Boom',
        expectSpinner: true,
        expectAlert: false,
        expectContent: false
      }
    ] as const
  ).forEach(({ name, isLoading, errorMessage, expectSpinner, expectAlert, expectContent }) => {
    it(`should render the right state ${name}`, async () => {
      host.isLoading.set(isLoading);
      host.errorMessage.set(errorMessage);
      fixture.detectChanges();

      const spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);
      const alert = fixture.debugElement.query(By.css('[role="alert"]'));
      const content = fixture.debugElement.query(By.css('.projected'));

      expect(spinner !== null).toEqual(expectSpinner);
      expect(alert !== null).toEqual(expectAlert);
      expect(content !== null).toEqual(expectContent);
    });
  });

  it('should render the error message text inside the alert', () => {
    host.errorMessage.set('Something exploded');
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert.nativeElement.textContent).toContain('Something exploded');
  });
});
