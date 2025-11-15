import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerProfile, BingoCell } from '../types';

interface GameProps {
  onGameOver: (kubaWon: number) => void;
  player: PlayerProfile;
}

const BINGO_REWARD = 100;
const CALL_INTERVAL = 3000; // 3 seconds per number

const generateBingoCard = (): BingoCell[][] => {
  const card: BingoCell[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  const ranges = [
    { col: 0, min: 1, max: 15 },
    { col: 1, min: 16, max: 30 },
    { col: 2, min: 31, max: 45 },
    { col: 3, min: 46, max: 60 },
    { col: 4, min: 61, max: 75 },
  ];
  
  ranges.forEach(({ col, min, max }) => {
    const usedNumbers = new Set<number>();
    for (let row = 0; row < 5; row++) {
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (usedNumbers.has(num));
      usedNumbers.add(num);
      card[row][col] = { number: num, marked: false };
    }
  });

  card[2][2] = { number: 'FREE', marked: true };
  return card;
};

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const [card, setCard] = useState<BingoCell[][]>(generateBingoCard());
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set());
  const [availableNumbers] = useState(() => Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5));
  const [isBingo, setIsBingo] = useState(false);

  const lastCalledNumber = useMemo(() => {
    return availableNumbers[calledNumbers.size - 1] || null
  }, [calledNumbers, availableNumbers]);

  const checkBingo = useCallback((currentCard: BingoCell[][]) => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (currentCard[i].every(cell => cell.marked)) return true;
    }
    // Check columns
    for (let i = 0; i < 5; i++) {
      if (currentCard.every(row => row[i].marked)) return true;
    }
    // Check diagonals
    if (currentCard.every((row, i) => row[i].marked)) return true;
    if (currentCard.every((row, i) => row[4 - i].marked)) return true;
    
    return false;
  }, []);

  useEffect(() => {
    if (isBingo) return;
    const interval = setInterval(() => {
      setCalledNumbers(prev => {
        if (prev.size >= availableNumbers.length) {
          clearInterval(interval);
          onGameOver(0); // Game over, no win
          return prev;
        }
        const newCalled = new Set(prev);
        newCalled.add(availableNumbers[prev.size]);
        return newCalled;
      });
    }, CALL_INTERVAL);
    return () => clearInterval(interval);
  }, [availableNumbers, onGameOver, isBingo]);
  
  const handleCellClick = (row: number, col: number) => {
    if (isBingo) return;
    const cell = card[row][col];
    if (cell.number !== 'FREE' && calledNumbers.has(cell.number)) {
      const newCard = card.map(r => r.slice());
      newCard[row][col].marked = !newCard[row][col].marked;
      setCard(newCard);
      if (checkBingo(newCard)) {
        setIsBingo(true);
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        setTimeout(() => onGameOver(BINGO_REWARD), 1000);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="w-full text-center bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Number Called</p>
            <p className="text-6xl font-black text-yellow-400 h-16">{lastCalledNumber}</p>
        </div>
      <div className="grid grid-cols-5 gap-2 w-full max-w-sm aspect-square">
        {card.flat().map((cell, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          return (
            <button
              key={index}
              onClick={() => handleCellClick(row, col)}
              className={`flex items-center justify-center rounded-md aspect-square transition-all duration-200
                font-bold text-xl
                ${cell.marked ? 'bg-cyan-500 text-white scale-105 shadow-lg' : 'bg-gray-700 text-gray-200'}
                ${calledNumbers.has(cell.number as number) && !cell.marked ? 'hover:bg-gray-600' : ''}
                ${isBingo && cell.marked ? 'animate-bounce' : ''}
              `}
            >
              {cell.number}
            </button>
          );
        })}
      </div>
      {isBingo && <p className="text-3xl font-bold text-green-400 animate-pulse">BINGO!</p>}
    </div>
  );
};

export default Game;
