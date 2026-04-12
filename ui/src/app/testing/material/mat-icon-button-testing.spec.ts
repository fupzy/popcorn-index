import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { MaterialTesting } from './material-testing';

@Component({
  imports: [MatIconButton, MatIcon],
  template: `
    <button mat-icon-button><mat-icon class="fa-solid fa-plus"></mat-icon></button>
    <button mat-icon-button id="custom-id"><mat-icon class="fa-solid fa-plus"></mat-icon></button>
    <button mat-icon-button [disabled]="true"><mat-icon class="fa-solid fa-arrow-left"></mat-icon></button>
    <button mat-icon-button (click)="hasButtonBeenClicked.set(true)"><mat-icon class="fa-solid fa-minus"></mat-icon></button>
  `
})
class TestComponent {
  public hasButtonBeenClicked = signal(false);
}

describe('MatIconButtonTesting', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let materialTesting: MaterialTesting;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: true }
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    materialTesting = new MaterialTesting(fixture);
  });

  it('should create a MatIconButtonTesting instance', () => {
    expect(materialTesting.matIconButton).toBeTruthy();
  });

  it('should return the MatButtonHarness when using getMatIconButton', async () => {
    const button = await materialTesting.matIconButton.getMatIconButton('fa-plus');

    expect(button).toBeTruthy();
  });

  it('should return the MatButtonHarness when using getMatIconButton with a cssId', async () => {
    const button = await materialTesting.matIconButton.getMatIconButton('fa-plus', 'custom-id');

    expect(button).toBeTruthy();
  });

  it('should return true when using exists on an existing icon button', async () => {
    const buttonExists = await materialTesting.matIconButton.exists('fa-plus');

    expect(buttonExists).toEqual(true);
  });

  it('should return true when using exists on an existing icon button with a cssId', async () => {
    const buttonExists = await materialTesting.matIconButton.exists('fa-plus', 'custom-id');

    expect(buttonExists).toEqual(true);
  });

  it('should return false when using exists on a non existing icon button', async () => {
    const buttonExists = await materialTesting.matIconButton.exists('non-existing-button');

    expect(buttonExists).toEqual(false);
  });

  it('should return false when using isDisabled on a non disabled icon button', async () => {
    const isDisabled = await materialTesting.matIconButton.isDisabled('fa-plus');

    expect(isDisabled).toEqual(false);
  });

  it('should return true when using isDisabled on a disabled icon button', async () => {
    const isDisabled = await materialTesting.matIconButton.isDisabled('fa-arrow-left');

    expect(isDisabled).toEqual(true);
  });

  it('should click when using click on a clickable icon button', async () => {
    const hasButtonBeenClickedBeforeClicking = component.hasButtonBeenClicked();
    expect(hasButtonBeenClickedBeforeClicking).toEqual(false);

    await materialTesting.matIconButton.click('fa-minus');

    const hasButtonBeenClickedAfterClicking = component.hasButtonBeenClicked();
    expect(hasButtonBeenClickedAfterClicking).toEqual(true);
  });
});
