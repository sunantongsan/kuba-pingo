import React from 'react';
import { PlayerProfile } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { useTonWallet } from '@tonconnect/ui-react';

interface MenuProps {
  onStartGame: () => void;
  onClaim: () => void;
  player: PlayerProfile;
  kubaBalance: number;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, onClaim, player, kubaBalance }) => {
  const wallet = useTonWallet();

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome, {player.name}!</CardTitle>
          <CardDescription>Ready to win some KUBA?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Your Unclaimed Balance</p>
            <p className="text-4xl font-bold text-cyan-400">{kubaBalance.toLocaleString()} KUBA</p>
          </div>
          <Button onClick={onStartGame} size="lg" className="w-full">
            Play Now
          </Button>
          <Button 
            onClick={onClaim} 
            variant="secondary" 
            size="lg" 
            className="w-full"
            disabled={!wallet || kubaBalance <= 0}
            >
            {wallet ? 'Claim Your KUBA' : 'Connect Wallet to Claim'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Menu;
