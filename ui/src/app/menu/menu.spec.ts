import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MaterialTesting, provideRoutingTesting } from '@testing';

import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let materialTesting: MaterialTesting;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Menu],
      providers: [provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;

    materialTesting = new MaterialTesting(fixture);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a Home button', async () => {
    const buttonExists = await materialTesting.matButton.exists('Home');

    expect(buttonExists).toBeTruthy();
  });

  it('should navigate to /home when clicking on the Home button', async () => {
    await materialTesting.matButton.click('Home');

    expect(router.url).toEqual('/home');
  });
});
