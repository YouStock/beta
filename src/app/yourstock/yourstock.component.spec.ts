import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourstockComponent } from './yourstock.component';

describe('YourstockComponent', () => {
  let component: YourstockComponent;
  let fixture: ComponentFixture<YourstockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourstockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourstockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
