// Розміщення файлу: src/app/app.component.ts
import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBoardComponent } from './components/game-board/game-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// Клас AppComponent перейменовано на App для уникнення конфлікту при об'єднанні файлів
export class App {
  @ViewChild('gameBoardComponent') gameBoard!: GameBoardComponent;

  public restartGame(): void {
    if (this.gameBoard) {
      this.gameBoard.restartGame();
    }
  }
}
