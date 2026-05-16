import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { User, ScoreResponse } from './types';
import { Login } from './views/Login';
import { PhaseUpgrade } from './views/PhaseUpgrade';
import GeneralMap from './views/GeneralMap';
import { Phase1 } from './phases/Phase1';
import { Phase2 } from './phases/Phase2';
import { PhaseX } from './phases/PhasePlaceholder';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('math_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('math_token'));
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'map' | 'phase1' | 'phase2' | 'phaseX'>('map');
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradedFromTo, setUpgradedFromTo] = useState<{from: number, to: number} | null>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        else logout();
        setLoading(false);
      });
    }
  }, [token]);

  const onLogin = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('math_token', newToken);
    setCurrentView('map');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('math_token');
  };

  const handleUpdateProgress = (resp: ScoreResponse) => {
    if (!user) return;
    const oldPhase = user.current_phase;
    setUser({ ...user, progress: resp.progress, current_phase: resp.current_phase });
    
    if (resp.phase_upgraded) {
      setUpgradedFromTo({ from: oldPhase, to: resp.current_phase });
      setIsUpgrading(true);
    }
  };

  const handleSelectPhaseFromMap = (phaseIndex: number) => {
     setSelectedPhase(phaseIndex);
     if (phaseIndex === 1) setCurrentView('phase1');
     else if (phaseIndex === 2) setCurrentView('phase2');
     else setCurrentView('phaseX');
  };

  const handleBackToMap = () => {
      setCurrentView('map');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display font-bold text-slate-400">Cargando...</div>;
  if (!user) return <Login onLogin={onLogin} />;
  
  if (isUpgrading && upgradedFromTo) {
     return <PhaseUpgrade 
        fromPhase={upgradedFromTo.from + 1} 
        toPhase={upgradedFromTo.to + 1} 
        onContinue={() => {
           setIsUpgrading(false);
           setCurrentView('map');
        }} 
     />;
  }

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
         {currentView === 'map' && (
             <GeneralMap key="map" user={user} onSelectPhase={handleSelectPhaseFromMap} onLogout={logout} />
         )}
         {currentView === 'phase1' && (
             <Phase1 key="phase1" user={user} onBackMap={handleBackToMap} onUpdateProgress={handleUpdateProgress} />
         )}
         {currentView === 'phase2' && (
             <Phase2 key="phase2" user={user} onBackMap={handleBackToMap} />
         )}
         {currentView === 'phaseX' && (
             <PhaseX key="phaseX" phaseNum={selectedPhase} onBackMap={handleBackToMap} />
         )}
      </AnimatePresence>
    </div>
  );
}
