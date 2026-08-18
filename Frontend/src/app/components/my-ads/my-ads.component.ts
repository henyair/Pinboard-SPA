import { Component, OnInit } from '@angular/core';
import { AdCardComponent } from '../ad-card/ad-card.component';
import { AdFormComponent } from '../ad-form/ad-form.component';
import { AdService } from '../../services/ad.service';
import { AdItem } from '../../models/ad-item.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [AdCardComponent, AdFormComponent],
  templateUrl: './my-ads.component.html',
  styleUrl: './my-ads.component.scss'
})
export class MyAdsComponent implements OnInit {
  ads: AdItem[] = [];
  showForm = false;
  selectedAd: AdItem | null = null;

  constructor(private adService: AdService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAds();
    this.adService.refreshAds$.subscribe(() => {
      this.loadAds();
    });
  }

  loadAds(): void {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    this.adService.getAds().subscribe(
      data => {
        // Filter ads manually for the specific user
        this.ads = data.filter(ad => ad.authorId === userId);
      }
    );
  }

  openEditForm(ad: AdItem) {
    this.selectedAd = ad;
    this.showForm = true;
  }

  closeEditForm() {
    this.selectedAd = null;
    this.showForm = false;
  }

  deleteAd(id: string) {
    if (confirm('Are you sure you want to delete this ad?')) {
      this.adService.deleteAd(id).subscribe(() => {
        this.adService.refreshAds$.next();
      });
    }
  }
}
