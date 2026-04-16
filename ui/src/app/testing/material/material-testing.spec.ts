import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTesting } from './material-testing';
import { MatButtonTesting } from './mat-button-testing';
import { MatIconButtonTesting } from './mat-icon-button-testing';
import { MatFormFieldTesting } from './mat-form-field-testing';

@Component({
  template: `<span>testing</span>`
})
class TestComponent {}

describe('MaterialTesting', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create a MaterialTesting instance', () => {
    const material = new MaterialTesting(fixture);

    expect(material).toBeTruthy();
  });

  it('should initialize all helpers', () => {
    const material = new MaterialTesting(fixture);

    expect(material.matButton).toBeTruthy();
    expect(material.matButton).toBeInstanceOf(MatButtonTesting);
    expect(material.matIconButton).toBeTruthy();
    expect(material.matIconButton).toBeInstanceOf(MatIconButtonTesting);
    expect(material.matFormField).toBeTruthy();
    expect(material.matFormField).toBeInstanceOf(MatFormFieldTesting);
  });
});
