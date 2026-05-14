import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { MaterialTesting } from './material-testing';

@Component({
  imports: [MatProgressSpinner],
  template: `
    @if (showSpinner()) {
      <mat-progress-spinner mode="indeterminate" />
    }
  `
})
class TestComponent {
  public readonly showSpinner = signal(true);
}

describe('MatProgressSpinnerTesting', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let materialTesting: MaterialTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    materialTesting = new MaterialTesting(fixture);
    fixture.detectChanges();
  });

  it('should return the MatProgressSpinnerHarness when using getMatProgressSpinner', async () => {
    const spinner = await materialTesting.matProgressSpinner.getMatProgressSpinner();

    expect(spinner).toBeTruthy();
  });

  it('should return true when using exists with a visible spinner', async () => {
    const exists = await materialTesting.matProgressSpinner.exists();

    expect(exists).toEqual(true);
  });

  it('should return false when using exists with no spinner in the DOM', async () => {
    component.showSpinner.set(false);
    fixture.detectChanges();

    const exists = await materialTesting.matProgressSpinner.exists();

    expect(exists).toEqual(false);
  });
});
