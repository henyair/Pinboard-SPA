import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdService } from '../../services/ad.service';
import { AdItem } from '../../models/ad-item.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ad-form.component.html',
  styleUrl: './ad-form.component.scss'
})
export class AdFormComponent implements OnInit {
  @Input() adToEdit: AdItem | null = null;
  @Output() closeForm = new EventEmitter<void>();
  
  adForm: FormGroup;
  latitude?: number;
  longitude?: number;
  locationError?: string;
  isSubmitting = false;
  successMessage?: string;

  categories = ['Buy & Sell', 'Events', 'Rent', 'Travel', 'Other'];

  constructor(
    private fb: FormBuilder, 
    private adService: AdService, 
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.adForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      locationName: [''],
      contactInfo: ['', Validators.required],
      price: [null],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    if (this.adToEdit) {
      this.adForm.patchValue(this.adToEdit);
      this.latitude = this.adToEdit.latitude;
      this.longitude = this.adToEdit.longitude;
    }
  }

  getLocation(): void {
    this.locationError = undefined;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          
          // Reverse geocoding
          this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitude}&lon=${this.longitude}`)
            .subscribe({
              next: (res) => {
                const city = res.address?.city || res.address?.town || res.address?.village || 'Unknown';
                this.adForm.patchValue({ locationName: city });
              },
              error: (err) => {
                console.error('Reverse geocoding failed', err);
              }
            });
        },
        (error) => {
          this.locationError = 'Unable to retrieve location. Please allow access.';
          console.error(error);
        }
      );
    } else {
      this.locationError = 'Geolocation is not supported by your browser.';
    }
  }

  onSubmit(): void {
    if (this.adForm.invalid) {
      this.adForm.markAllAsTouched();
      return;
    }

    if (this.latitude === undefined || this.longitude === undefined) {
      this.locationError = 'Please get your location first before posting the ad.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = undefined;
    this.locationError = undefined;

    const adItem: AdItem = {
      ...this.adForm.value,
      latitude: this.latitude,
      longitude: this.longitude,
      authorName: this.adToEdit ? this.adToEdit.authorName : (this.authService.currentUserValue?.username || 'Anonymous')
    };

    if (this.adToEdit && this.adToEdit.id) {
      // Edit Mode
      adItem.id = this.adToEdit.id;
      adItem.authorId = this.adToEdit.authorId;
      this.adService.updateAd(this.adToEdit.id, adItem).subscribe({
        next: () => {
          this.handleSuccess('Ad updated successfully!');
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      // Create Mode
      this.adService.createAd(adItem).subscribe({
        next: () => {
          this.handleSuccess('Ad created successfully!');
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  private handleSuccess(msg: string) {
    this.isSubmitting = false;
    this.successMessage = msg;
    this.adForm.reset({ category: '' });
    this.latitude = undefined;
    this.longitude = undefined;
    this.adService.refreshAds$.next();
    this.closeForm.emit();
  }

  private handleError(err: any) {
    this.isSubmitting = false;
    console.error('Error saving ad', err);
  }
}
