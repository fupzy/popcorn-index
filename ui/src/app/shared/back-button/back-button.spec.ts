import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTesting } from '@testing';

import { BackButton } from './back-button';

describe('BackButton', () => {
  let fixture: ComponentFixture<BackButton>;
  let materialTesting: MaterialTesting<BackButton>;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BackButton],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(BackButton);
    location = TestBed.inject(Location);
    materialTesting = new MaterialTesting(fixture);

    fixture.detectChanges();
  });

  it('should render a labeled icon button', async () => {
    const exists = await materialTesting.matIconButton.exists('mat-icon');

    expect(exists).toEqual(true);
  });

  it('should call Location.back() when clicked', async () => {
    const backSpy = vi.spyOn(location, 'back');

    await materialTesting.matIconButton.click('mat-icon');

    expect(backSpy).toHaveBeenCalledOnce();
  });
});
