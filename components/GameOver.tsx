import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface GameOverProps {
  kubaWon: number;
  totalKuba: number;
  onPlayAgain: () => void;
  onGoToMenu: () => void;
  onClaimReward: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ kubaWon, totalKuba, onPlayAgain, onGoToMenu, onClaimReward }) => {
  const hasWon = kubaWon > 0;
  // If the player won, the reward is not yet claimed. If they lost, there's nothing to claim.
  const [isClaimed, setIsClaimed] = useState(!hasWon);

  const handleClaim = () => {
    onClaimReward();
    setIsClaimed(true);
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in-up w-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className={`text-5xl font-bold ${hasWon ? 'text-green-400' : 'text-red-500'}`}>
            {hasWon ? 'BINGO!' : 'Game Over'}
          </CardTitle>
          {hasWon && (
            <CardDescription className="text-xl text-gray-400 pt-2">
              You won
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {hasWon && (
            <>
              <p className="text-7xl font-bold text-cyan-400">{kubaWon}</p>
              <p className="text-lg -mt-4 text-cyan-400/80">KUBA</p>
            </>
          )}

          {!isClaimed && hasWon && (
            <Button onClick={handleClaim} size="lg" className="w-full animate-pulse">
              Watch Ad to Claim Reward
            </Button>
          )}

          <div className="bg-gray-900/50 rounded-lg p-3 w-full">
            <p className="text-gray-400 text-sm">Unclaimed Balance</p>
            <p className="text-2xl font-bold text-white">{totalKuba.toLocaleString()} KUBA</p>
          </div>

          {isClaimed && hasWon && (
            <p className="text-sm font-semibold text-green-500">Reward Claimed!</p>
          )}

          <div className="flex gap-4 w-full">
            <Button onClick={onPlayAgain} className="flex-1" size="lg" disabled={!isClaimed}>
              Play Again
            </Button>
            <Button onClick={onGoToMenu} variant="secondary" className="flex-1" size="lg" disabled={!isClaimed}>
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;