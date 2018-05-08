import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletNewComponent } from './wallet-new.component';

describe('WalletNewComponent', () => {
  let component: WalletNewComponent;
  let fixture: ComponentFixture<WalletNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
