import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { CardData, GameLevel } from '../../models/card.model';

declare var Tone: any;

class SoundService {
  private matchSynth: any;
  private missSynth: any;
  private winMelody: any;

  constructor() {
    this.matchSynth = new Tone.Synth({
      oscillator: {type: 'triangle'},
      envelope: {attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2}
    }).toDestination();
    this.matchSynth.volume.value = -5;

    this.missSynth = new Tone.NoiseSynth({
      noise: {type: 'pink'},
      envelope: {attack: 0.005, decay: 0.1, sustain: 0, release: 0.05}
    }).toDestination();
    this.winMelody = new Tone.Synth().toDestination();
    this.winMelody.volume.value = -8;
  }

  public playMatch() {
    const now = Tone.now();
    this.matchSynth.triggerAttackRelease("G5", "8n", now);
    this.matchSynth.triggerAttackRelease("B5", "8n", now + 0.05);
  }

  public playMiss() {
    this.missSynth.triggerAttackRelease("16n");
  }

  public playWin() {
    const now = Tone.now();
    this.winMelody.triggerAttackRelease("C6", "16n", now);
    this.winMelody.triggerAttackRelease("E6", "16n", now + 0.1);
    this.winMelody.triggerAttackRelease("G6", "8n", now + 0.2);
  }
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent implements OnInit, OnDestroy {
  public cards: CardData[] = [];
  public flippedCards: CardData[] = [];
  public gameState: 'menu' | 'playing' | 'won' = 'menu';

  public isProcessing = false;
  public matchedSets = 0;
  public timeDisplay = '00:00';

  public gameMode: 'single' | 'multi' = 'single';
  public activePlayer: 1 | 2 = 1;
  public scores = {p1: 0, p2: 0};
  public moves = 0;

  public currentLevel!: GameLevel;

  public levels: GameLevel[] = [
    {name: 'Простий', pairsCount: 6, matchSize: 2, cols: 4},
    {name: 'Середній', pairsCount: 10, matchSize: 2, cols: 5},
    {name: 'Складний', pairsCount: 16, matchSize: 2, cols: 8},
    {name: 'Експерт (Трійки!)', pairsCount: 8, matchSize: 3, cols: 6},
  ];

  private timerInterval: any;
  private startTime = 0;
  private possibleImageIds = Array.from({length: 50}, (_, i) => i + 10);

  private soundService: SoundService;

  constructor(private cdr: ChangeDetectorRef) {
    this.soundService = new SoundService();
  }

  ngOnInit(): void {
    if (typeof Tone !== 'undefined') {
      document.documentElement.addEventListener('click', () => {
        if (Tone.context.state !== 'running') {
          Tone.start();
        }
      }, {once: true});
    }
    this.gameState = 'menu';
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  public setGameMode(mode: 'single' | 'multi') {
    this.gameMode = mode;
  }

  public startGame(level: GameLevel) {
    this.currentLevel = level;
    this.gameState = 'playing';

    this.stopTimer();
    this.cards = [];
    this.flippedCards = [];
    this.matchedSets = 0;
    this.isProcessing = false;
    this.timeDisplay = '00:00';

    this.moves = 0;
    this.scores = {p1: 0, p2: 0};
    this.activePlayer = 1;

    const selectedIds = this.getRandomSubarray(this.possibleImageIds, level.pairsCount);

    selectedIds.forEach((imgId) => {
      const imgUrl = `https://picsum.photos/id/${imgId}/120/120`;
      for (let i = 0; i < level.matchSize; i++) {
        this.cards.push(this.createCard(imgId, imgUrl));
      }
    });

    this.shuffleCards();
    this.startTimer();
    this.cdr.detectChanges();
  }

  public restartGame() {
    if (this.currentLevel) {
      this.startGame(this.currentLevel);
    }
  }

  public goToMenu() {
    this.stopTimer();
    this.gameState = 'menu';
    this.cdr.detectChanges();
  }

  private startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = now - this.startTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private getRandomSubarray(arr: number[], size: number): number[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  private createCard(imageId: number, imageUrl: string): CardData {
    return {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2),
      imageId,
      imageUrl,
      state: 'default'
    };
  }

  private shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public onCardClicked(card: CardData) {
    if (this.isProcessing || card.state !== 'default') return;

    const cardIndex = this.cards.findIndex((c: CardData) => c.id === card.id);
    if (cardIndex !== -1) {
      this.cards = this.cards.map((c, idx) =>
        idx === cardIndex ? {...c, state: 'flipped'} : c
      );
      this.flippedCards.push(this.cards[cardIndex]);
      this.cdr.detectChanges();
    }

    if (this.flippedCards.length === this.currentLevel.matchSize) {
      if (this.gameMode === 'single') {
        this.moves++;
      }
      this.checkForMatch();
    }
  }

  private checkForMatch() {
    this.isProcessing = true;
    const firstId = this.flippedCards[0].imageId;
    const isMatch = this.flippedCards.every(card => card.imageId === firstId);

    if (isMatch) {
      this.soundService.playMatch();
      this.matchedSets++;

      if (this.gameMode === 'multi') {
        if (this.activePlayer === 1) this.scores.p1++;
        else this.scores.p2++;
      }

      if (this.matchedSets === this.currentLevel.pairsCount) {
        this.stopTimer();
        this.soundService.playWin();
        setTimeout(() => {
          this.gameState = 'won';
          this.cdr.detectChanges();
        }, 600);
      }

      setTimeout(() => {
        this.cards = this.cards.map(c =>
          this.flippedCards.some(f => f.id === c.id) ? {...c, state: 'matched'} : c
        );
        this.flippedCards = [];
        this.isProcessing = false;
        this.cdr.markForCheck();
      }, 600);

    } else {
      this.soundService.playMiss();

      setTimeout(() => {
        this.cards = this.cards.map(c =>
          this.flippedCards.some(f => f.id === c.id) ? {...c, state: 'default'} : c
        );
        this.flippedCards = [];

        if (this.gameMode === 'multi') {
          this.activePlayer = this.activePlayer === 1 ? 2 : 1;
        }

        this.isProcessing = false;
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  public getMultiplayerWinner(): string {
    if (this.scores.p1 > this.scores.p2) return 'Гравець 1';
    if (this.scores.p2 > this.scores.p1) return 'Гравець 2';
    return 'Нічия';
  }
}
