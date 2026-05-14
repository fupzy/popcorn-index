import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatIconHarness } from '@angular/material/icon/testing';

import { MAX_RATING_STARS, RatingStars } from './rating-stars';

const filledIconName = 'star';
const halfIconName = 'star_half';
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

  it('should render filled stars up to the value (0-10 scale), then empty stars for the rest', async () => {
    fixture.componentRef.setInput('value', 6);
    fixture.detectChanges();

    const iconNames = await getIconNames();

    expect(iconNames).toEqual([filledIconName, filledIconName, filledIconName, emptyIconName, emptyIconName]);
  });

  it('should render a half star at the boundary for odd values', async () => {
    fixture.componentRef.setInput('value', 5);
    fixture.detectChanges();

    const iconNames = await getIconNames();

    expect(iconNames).toEqual([filledIconName, filledIconName, halfIconName, emptyIconName, emptyIconName]);
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

  it('should render a half and a full radio button per star in interactive mode', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));

    expect(buttons.length).toBe(MAX_RATING_STARS * 2);
  });

  [
    { description: 'half', buttonIndex: 4, expected: 5 },
    { description: 'full', buttonIndex: 5, expected: 6 }
  ].forEach(({ description, buttonIndex, expected }) => {
    it(`should emit valueChange with ${expected} when the ${description}-star button is clicked`, () => {
      fixture.componentRef.setInput('value', 0);
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.valueChange, 'emit');

      const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));
      buttons[buttonIndex].triggerEventHandler('click', null);

      expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
    });
  });

  [
    { description: 'half button', buttonIndex: 6, previewIcons: [filledIconName, filledIconName, filledIconName, halfIconName, emptyIconName] },
    { description: 'full button', buttonIndex: 7, previewIcons: [filledIconName, filledIconName, filledIconName, filledIconName, emptyIconName] }
  ].forEach(({ description, buttonIndex, previewIcons }) => {
    it(`should preview on mouseenter and restore on group mouseleave for the ${description}`, async () => {
      fixture.componentRef.setInput('value', 2);
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));
      buttons[buttonIndex].triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      const previewed = await getIconNames();

      expect(previewed).toEqual(previewIcons);

      fixture.debugElement.query(By.css('[role="radiogroup"]')).triggerEventHandler('mouseleave', null);
      fixture.detectChanges();

      const restored = await getIconNames();

      expect(restored).toEqual([filledIconName, emptyIconName, emptyIconName, emptyIconName, emptyIconName]);
    });

    it(`should preview on focus and restore on blur for the ${description}`, async () => {
      fixture.componentRef.setInput('value', 2);
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button[role="radio"]'));
      buttons[buttonIndex].triggerEventHandler('focus', null);
      fixture.detectChanges();

      const previewed = await getIconNames();

      expect(previewed).toEqual(previewIcons);

      buttons[buttonIndex].triggerEventHandler('blur', null);
      fixture.detectChanges();

      const restored = await getIconNames();

      expect(restored).toEqual([filledIconName, emptyIconName, emptyIconName, emptyIconName, emptyIconName]);
    });
  });
});
