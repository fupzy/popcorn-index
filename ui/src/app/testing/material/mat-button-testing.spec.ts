import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { MaterialTesting } from './material-testing';

@Component({
  imports: [MatButton, MatIcon],
  template: `
    <button mat-button>first button</button>
    <button mat-button [disabled]="true">disabled button</button>
    <button mat-button (click)="hasButtonBeenClicked.set(true)">clickable button</button>
    <button mat-button><i class="fa-solid fa-plus"></i>button with fa icon</button>
    <button mat-button><mat-icon class="fa-solid fa-minus"></mat-icon>button with mat icon</button>
  `
})
class TestComponent {
  public hasButtonBeenClicked = signal(false);
}

describe('MatButtonTesting', () => {
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

  it('should create a MatButtonTesting instance', () => {
    expect(materialTesting.matButton).toBeTruthy();
  });

  it('should return the MatButtonHarness when using getMatButton', async () => {
    const button = await materialTesting.matButton.getMatButton('first button');

    expect(button).toBeTruthy();
  });

  it('should return true when using exists on an existing button', async () => {
    const buttonExists = await materialTesting.matButton.exists('first button');

    expect(buttonExists).toEqual(true);
  });

  it('should return false when using exists on a non existing button', async () => {
    const buttonExists = await materialTesting.matButton.exists('this button does not exists');

    expect(buttonExists).toEqual(false);
  });

  it('should return false when using isDisabled on a non disabled button', async () => {
    const isDisabled = await materialTesting.matButton.isDisabled('first button');

    expect(isDisabled).toEqual(false);
  });

  it('should return true when using isDisabled on a disabled button', async () => {
    const isDisabled = await materialTesting.matButton.isDisabled('disabled button');

    expect(isDisabled).toEqual(true);
  });

  it('should click when using click on a clickable button', async () => {
    const hasButtonBeenClickedBeforeClicking = component.hasButtonBeenClicked();
    expect(hasButtonBeenClickedBeforeClicking).toEqual(false);

    await materialTesting.matButton.click('clickable button');

    const hasButtonBeenClickedAfterClicking = component.hasButtonBeenClicked();
    expect(hasButtonBeenClickedAfterClicking).toEqual(true);
  });

  [
    { label: 'button with fa icon', icon: 'fa-plus', expected: true },
    { label: 'button with mat icon', icon: 'fa-minus', expected: true },
    { label: 'button with fa icon', icon: 'fa-minus', expected: false },
    { label: 'first button', icon: 'fa-plus', expected: false }
  ].forEach(({ label, icon, expected }) => {
    it(`should return ${expected} when using hasIcon with icon "${icon}" on "${label}"`, async () => {
      const hasIcon = await materialTesting.matButton.hasIcon(label, icon);

      expect(hasIcon).toEqual(expected);
    });
  });
});
