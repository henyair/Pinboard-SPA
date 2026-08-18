import { Component, OnInit } from '@angular/core';
import { AdCardComponent } from '../ad-card/ad-card.component';
import { AdFormComponent } from '../ad-form/ad-form.component';
import { AdService } from '../../services/ad.service';
import { AdItem } from '../../models/ad-item.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [AdCardComponent, AdFormComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  ads: AdItem[] = [];
  currentCategory = '';
  isLocationFiltered = false;
  showForm = false;
  selectedAd: AdItem | null = null;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.adService.filterChanges$.subscribe((filters) => {
      this.currentCategory = filters.category || '';
      this.isLocationFiltered = (filters.lat !== undefined && filters.lng !== undefined);
      this.loadAds();
    });

    this.adService.refreshAds$.subscribe(() => {
      this.loadAds();
    });
  }

  loadAds(): void {
    this.adService.getAds().subscribe(
      data => this.ads = data
    );
  }

  setCategory(cat: string) {
    this.adService.updateFilters({ category: cat });
  }

  clearLocationFilter() {
    this.adService.updateFilters({ lat: undefined, lng: undefined, radiusKm: undefined });
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
