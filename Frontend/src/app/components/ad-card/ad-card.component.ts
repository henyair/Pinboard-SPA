import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdItem } from '../../models/ad-item.model';
import { AdService } from '../../services/ad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent {
  @Input() ad!: AdItem;
  @Output() edit = new EventEmitter<AdItem>();
  @Output() delete = new EventEmitter<string>();

  constructor(private adService: AdService) {}

  get isOwner(): boolean {
    return this.ad.authorId === this.adService.currentUserId;
  }

  get categoryVarName(): string {
    switch (this.ad.category) {
      case 'Buy & Sell': return 'var(--cat-buy-sell)';
      case 'Events': return 'var(--cat-events)';
      case 'Rent': return 'var(--cat-rent)';
      case 'Travel': return 'var(--cat-travel)';
      case 'Other': return 'var(--cat-other)';
      default: return 'var(--cat-default)';
    }
  }
}
