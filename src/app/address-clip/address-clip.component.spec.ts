import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressClipComponent } from './address-clip.component';

describe('AddressClipComponent', () => {
  let component: AddressClipComponent;
  let fixture: ComponentFixture<AddressClipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressClipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressClipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
