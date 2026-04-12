import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { By } from '@angular/platform-browser';
import { MatCardHarness } from '@angular/material/card/testing';

import { provideRoutingTesting } from '@testing';

import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a material card', async () => {
    const card = await loader.getHarnessOrNull(MatCardHarness);

    expect(card).toBeTruthy();
  });

  it('should render the title', async () => {
    const expectedTitle = 'Popcorn Index';

    const card = await loader.getHarness(MatCardHarness);
    const title = await card.getTitleText();

    expect(title).toContain(expectedTitle);
  });

  it('should render the menu', async () => {
    const menu = fixture.debugElement.query(By.css('app-menu'));

    expect(menu).toBeTruthy();
  });
});
