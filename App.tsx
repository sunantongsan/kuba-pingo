import React, { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProfile } from './types';
import Menu from './components/Menu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { toNano } from 'ton';

const KUBA_BALANCE_KEY = 'kubaPingGoBalance';
const FEE_WALLET_ADDRESS = 'UQAO4R2zQq4CiXzFHv3DuTBhoSeh3o6ldyHrTt8R_VpsXHRl';
const CLAIM_FEE_TON = '0.5';
const AD_URL = 'https://otieu.com/4/10189801';

// Mock KUBA Token Address (as the provided one is EVM)
const KUBA_TOKEN_INFO = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM91';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [kubaBalance, setKubaBalance] = useState<number>(0);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    // Initialize Telegram Web App SDK
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user) {
      setPlayer({ name: user.first_name || 'Player' });
    } else {
      setPlayer({ name: 'Player' }); // Fallback for development
    }

    // Load balance from local storage
    const storedBalance = localStorage.getItem(KUBA_BALANCE_KEY);
    if (storedBalance) {
      setKubaBalance(parseInt(storedBalance, 10));
    }
  }, []);

  const saveBalance = (balance: number) => {
    setKubaBalance(balance);
    localStorage.setItem(KUBA_BALANCE_KEY, balance.toString());
  };

  const handleStartGame = () => {
    setGameState(GameState.PLAYING);
    setLastWinAmount(0);
  };

  const handleGameOver = useCallback((kubaWon: number) => {
    setLastWinAmount(kubaWon);
    setGameState(GameState.GAME_OVER);
  }, []);

  const handlePlayAgain = () => {
    setGameState(GameState.PLAYING);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
  };
  
  const handleClaimReward = () => {
    if (lastWinAmount > 0) {
      window.Telegram.WebApp.openLink(AD_URL);
      saveBalance(kubaBalance + lastWinAmount);
    }
  };

  const handleClaim = async () => {
    if (kubaBalance <= 0) {
      window.Telegram.WebApp.showAlert('You have no KUBA to claim.');
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: FEE_WALLET_ADDRESS,
            amount: toNano(CLAIM_FEE_TON).toString(),
          },
          // In a real scenario, a second message would be sent to the KUBA
          // token contract to trigger the transfer.
          // {
          //   address: KUBA_TOKEN_INFO,
          //   amount: toNano('0.05').toString(), // for contract gas fees
          //   payload: buildClaimPayload(kubaBalance)
          // }
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      
      // On successful transaction, we assume the claim is processed.
      // A more robust solution would involve backend verification.
      window.Telegram.WebApp.showAlert(`Claim processed! Your KUBA tokens are on their way.`);
      saveBalance(0);

    } catch (error) {
      console.error('Claim failed:', error);
      window.Telegram.WebApp.showAlert('Claim transaction failed or was rejected.');
    }
  };


  const renderContent = () => {
    if (!player) {
      return <div className="text-center">Loading Player Data...</div>;
    }
    switch (gameState) {
      case GameState.PLAYING:
        return <Game onGameOver={handleGameOver} player={player} />;
      case GameState.GAME_OVER:
        return (
          <GameOver
            kubaWon={lastWinAmount}
            totalKuba={kubaBalance}
            onPlayAgain={handlePlayAgain}
            onGoToMenu={handleBackToMenu}
            onClaimReward={handleClaimReward}
          />
        );
      case GameState.MENU:
      default:
        return (
          <Menu
            onStartGame={handleStartGame}
            onClaim={handleClaim}
            player={player}
            kubaBalance={kubaBalance}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-between p-4 font-sans max-w-lg mx-auto">
       <header className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">KUBA PingGo</h1>
        <TonConnectButton />
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
         {renderContent()}
      </main>
      <footer className="text-center text-xs text-gray-600 w-full pb-2">
         Claim fee: {CLAIM_FEE_TON} TON | Powered by KUBA & The Open Network
      </footer>
    </div>
  );
};

export default App;