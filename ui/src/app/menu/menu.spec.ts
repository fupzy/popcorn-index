import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Router } from '@angular/router';
import { MatButtonHarness } from '@angular/material/button/testing';

import { provideRoutingTesting } from '@testing';

import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let loader: HarnessLoader;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a Home button', async () => {
    const button = await loader.getHarnessOrNull(MatButtonHarness.with({ text: 'Home' }));

    expect(button).toBeTruthy();
  });

  it('should navigate to /home when clicking on the Home button', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Home' }));

    await button.click();

    expect(router.url).toEqual('/home');
  });
});
