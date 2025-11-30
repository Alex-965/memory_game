import { Component, EventEmitter, Input, Output, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CardData } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input({ required: true }) card!: CardData;
  @Output() cardClicked = new EventEmitter<CardData>();

  @HostBinding('class.matched') get isMatched() {
    return this.card.state === 'matched';
  }

  handleClick() {
    if (this.card.state === 'default') {
      this.cardClicked.emit(this.card);
    }
  }
}
