import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatIconHarness } from '@angular/material/icon/testing';

import { MAX_RATING_STARS, RatingStars } from './rating-stars';

const filledIconName = 'star';
const emptyIconName = 'star_border';

describe('RatingStars', () => {
  let fixture: ComponentFixture<RatingStars>;
  let component: RatingStars;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingStars],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(RatingStars);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  const getIconNames = async (): Promise<(string | null)[]> => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    return Promise.all(icons.map((icon) => icon.getName()));
  };

  it(`should render ${MAX_RATING_STARS} empty stars when value is 0`, async () => {
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();

    const iconNames = await getIconNames();

    expect(iconNames).toEqual(Array(MAX_RATING_STARS).fill(emptyIconName));
  });

  it('should render filled stars up to the value, then empty stars for the rest', async () => {
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    const iconNames = await getIconNames();

    expect(iconNames).toEqual([filledIconName, filledIconName, filledIconName, emptyIconName, emptyIconName]);
  });

  it('should render plain icons (no buttons) in readonly mode', async () => {
    fixture.componentRef.setInput('value', 2);
    fixture.componentRef.setInput('interactive', false);
    fixture.detectChanges();

    const icons = await loader.getAllHarnesses(MatIconHarness);
    const buttons = fixture.debugElement.queryAll(By.css('button'));

    expect(icons.length).toBe(MAX_RATING_STARS);
    expect(buttons.length).toBe(0);
  });

  it('should render a button per star in interactive mode', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));

    expect(buttons.length).toBe(MAX_RATING_STARS);
  });

  it('should emit valueChange with the clicked star', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.valueChange, 'emit');

    const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));
    buttons[3].triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(4);
  });
});
