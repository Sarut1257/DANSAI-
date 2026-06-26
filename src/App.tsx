import React, { useState, useEffect } from 'react';
import { GameScreen, GameOptions, PlayerSkin, ScoreRecord } from './types';
import { synth } from './utils/audio';
import GameCanvas from './components/GameCanvas';
import OptionsMenu from './components/OptionsMenu';
import HowToPlay from './components/HowToPlay';
import EndingCutscene from './components/EndingCutscene';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Settings, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Trophy, 
  User, 
  Sparkles,
  Calendar,
  Gamepad2,
  ChevronRight,
  Flame
} from 'lucide-react';

const DEFAULT_OPTIONS: GameOptions = {
  controls: {
    left: 'a',
    right: 'd',
    jump: 'w',
    action: 's',
  },
  soundEnabled: true,
  musicEnabled: true,
  difficulty: 'normal',
  selectedSkinId: 'classic_red',
  showOnScreenButtons: true
};

const SKINS: PlayerSkin[] = [
  {
    id: 'classic_red',
    name: 'ชาดคลาสสิก (Crimson Mask)',
    color: '#dc2626',
    maskColor: '#ffffff',
    glowColor: '#ef4444',
    speedMultiplier: 1.0,
  },
  {
    id: 'sapphire_blue',
    name: 'ไพลินลึกลับ (Sapphire Spirit)',
    color: '#2563eb',
    maskColor: '#e0f2fe',
    glowColor: '#38bdf8',
    speedMultiplier: 1.15,
  },
  {
    id: 'emerald_green',
    name: 'มรกตศักดิ์สิทธิ์ (Emerald Guard)',
    color: '#16a34a',
    maskColor: '#f0fdf4',
    glowColor: '#4ade80',
    speedMultiplier: 1.05,
  },
  {
    id: 'legendary_gold',
    name: 'ทองคำพุทธคุณ (Golden Legend)',
    color: '#ca8a04',
    maskColor: '#fef08a',
    glowColor: '#facc15',
    speedMultiplier: 1.25,
  }
];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.MENU);
  const [options, setOptions] = useState<GameOptions>(DEFAULT_OPTIONS);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState('ผู้กล้าด่านซ้าย');
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showHighscoreModal, setShowHighscoreModal] = useState(false);

  // Load saved configurations from LocalStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem('dansai_options');
    if (savedOptions) {
      try {
        setOptions(JSON.parse(savedOptions));
      } catch (e) {
        console.error('Error parsing saved options', e);
      }
    }

    const savedScores = localStorage.getItem('dansai_scores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error('Error parsing saved scores', e);
      }
    } else {
      // Default initial local high scores
      const initialScores: ScoreRecord[] = [
        { playerName: 'ผีตาโขนหัวโต', score: 350, date: '2026-06-25' },
        { playerName: 'หนุ่มด่านซ้าย', score: 210, date: '2026-06-24' },
        { playerName: 'สายลุยเลย', score: 120, date: '2026-06-23' }
      ];
      setScores(initialScores);
      localStorage.setItem('dansai_scores', JSON.stringify(initialScores));
    }

    const savedName = localStorage.getItem('dansai_player_name');
    if (savedName) {
      setCurrentPlayerName(savedName);
    }
  }, []);

  // Control Background Music Loop based on Screen changes & options
  useEffect(() => {
    if (screen === GameScreen.PLAYING && options.musicEnabled) {
      synth.startMusic(true);
    } else {
      synth.stopMusic();
    }
    return () => {
      synth.stopMusic();
    };
  }, [screen, options.musicEnabled]);

  const handleSaveOptions = (newOptions: GameOptions) => {
    setOptions(newOptions);
    localStorage.setItem('dansai_options', JSON.stringify(newOptions));
  };

  const handleStartGame = () => {
    synth.playStart(options.soundEnabled);
    setScreen(GameScreen.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    setLastScore(finalScore);
    setScreen(GameScreen.GAME_OVER);

    // Save score automatically to history
    const newRecord: ScoreRecord = {
      playerName: currentPlayerName || 'ผู้กล้าด่านซ้าย',
      score: finalScore,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedScores = [...scores, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Keep top 8 scores

    setScores(updatedScores);
    localStorage.setItem('dansai_scores', JSON.stringify(updatedScores));
  };

  const handleEnding = (finalScore: number) => {
    setLastScore(finalScore);
    setScreen(GameScreen.ENDING);

    // Save ending highscore to history
    const newRecord: ScoreRecord = {
      playerName: currentPlayerName || 'ผู้กล้าด่านซ้าย',
      score: finalScore,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedScores = [...scores, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setScores(updatedScores);
    localStorage.setItem('dansai_scores', JSON.stringify(updatedScores));
  };

  const savePlayerName = (name: string) => {
    setCurrentPlayerName(name);
    localStorage.setItem('dansai_player_name', name);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-between py-6 px-4 md:py-10 relative overflow-hidden select-none selection:bg-red-500/30 selection:text-white">
      {/* Mystical Thai traditional aesthetic decorative blurred ambient background circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-red-950/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-orange-950/10 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {screen === GameScreen.MENU && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
              key="menu"
            >
              {/* Game Brand Logo Container */}
              <div className="relative mb-6 max-w-sm w-full flex justify-center group">
                <div className="absolute -inset-1 bg-red-600 rounded-lg blur-md opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative p-2 flex flex-col items-center w-full">
                  <img
                    src="https://res.cloudinary.com/dlcqcokoo/image/upload/v1782439994/logo_wg2sze.png"
                    alt="Dan Sai Adventure Logo"
                    className="h-28 md:h-32 object-contain select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] transform group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Decorative caption */}
                  <span className="text-[10px] text-zinc-500 tracking-[0.25em] font-mono mt-3 uppercase">
                    Thai Festival Action Adventure
                  </span>
                </div>
              </div>

              {/* Title & Slogan */}
              <div className="text-center mb-10 font-kanit">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase text-white" style={{ letterSpacing: '-2px' }}>
                  Dan Sai <span className="text-red-600">Adventure</span>
                </h1>
                <div className="h-1 w-24 bg-red-600 mt-4 mx-auto"></div>
                <p className="text-xs text-zinc-500 uppercase tracking-[0.15em] mt-3 font-light">
                  ดินแดนหน้ากากผีตาโขนศักดิ์สิทธิ์ ผจญภัยสะสมความสุขสืบสานตำนานด่านซ้าย
                </p>
              </div>

              {/* Dynamic Grid Layout for Single-Screen Menu Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-3xl">
                {/* Left Side: Game Menu List */}
                <div className="md:col-span-6 flex flex-col justify-center space-y-8 pr-0 md:pr-4">
                  {/* Player Name Tag Input */}
                  <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-sm p-4 font-kanit">
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">
                      ชื่อผู้เล่นของคุณ (Player Tag)
                    </label>
                    <div className="relative flex items-center">
                      <User size={14} className="text-zinc-600 absolute left-3" />
                      <input
                        type="text"
                        maxLength={20}
                        value={currentPlayerName}
                        onChange={(e) => savePlayerName(e.target.value)}
                        className="w-full bg-black/60 border border-zinc-850 rounded-sm pl-9 pr-4 py-2 text-xs text-white font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder-zinc-800 uppercase tracking-wider"
                        placeholder="กรอกชื่อผู้เล่น..."
                        id="input-player-name"
                      />
                    </div>
                  </div>

                  {/* Menu buttons following Artistic Design theme guidelines */}
                  <div className="space-y-6">
                    <div
                      onClick={handleStartGame}
                      className="group cursor-pointer text-left focus:outline-none focus:ring-0 select-none"
                      id="btn-play-game"
                      role="button"
                      tabIndex={0}
                    >
                      <span className="text-3xl font-black tracking-tight hover:text-red-500 text-white transition-colors duration-200 block underline underline-offset-8 decoration-red-600 uppercase font-kanit">
                        START GAME
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-kanit font-light">
                        เข้าเล่นเกมร่วมฉลองเทศกาลผีตาโขน • ENTER THE SPIRIT BRIDGE
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        synth.playStart(options.soundEnabled);
                        setScreen(GameScreen.OPTIONS);
                      }}
                      className="group cursor-pointer text-left focus:outline-none focus:ring-0 select-none"
                      id="btn-options"
                      role="button"
                      tabIndex={0}
                    >
                      <span className="text-3xl font-black tracking-tight hover:text-red-500 text-white transition-colors duration-200 block uppercase font-kanit">
                        OPTIONS
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-kanit font-light">
                        ปรับค่าการบังคับ ปุ่มตัวละคร และระบบเสียง • CONFIG EXPERIENCE
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        synth.playStart(options.soundEnabled);
                        setScreen(GameScreen.HOW_TO_PLAY);
                      }}
                      className="group cursor-pointer text-left focus:outline-none focus:ring-0 select-none"
                      id="btn-howtoplay"
                      role="button"
                      tabIndex={0}
                    >
                      <span className="text-3xl font-black tracking-tight hover:text-red-500 text-white transition-colors duration-200 block uppercase font-kanit">
                        HOW TO PLAY
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-kanit font-light">
                        ตำนาน ข้าวเหนียวด่านซ้าย และขวากหนาม • READ TALES & RULES
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: High Scores / Leaderboard Ledger */}
                <div className="md:col-span-6 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-sm flex flex-col font-kanit relative overflow-hidden shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-red-500" size={16} />
                      <span className="text-xs font-semibold tracking-widest text-red-500 uppercase">
                        HIGH SCORES
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 tracking-wider font-mono">DAN SAI LEDGER</span>
                  </div>

                  <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto pr-1">
                    {scores.length === 0 ? (
                      <div className="text-zinc-600 text-xs text-center py-8">
                        ยังไม่มีประวัติคะแนนในขณะนี้
                      </div>
                    ) : (
                      scores.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b border-zinc-900/50 text-xs text-zinc-300 hover:bg-zinc-800/20 transition-all px-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-500 w-4 text-center">
                              {idx + 1}.
                            </span>
                            <span className="font-medium tracking-wide uppercase">
                              {rec.playerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-sm font-bold text-white">{rec.score}</span>
                            <span className="text-[9px] text-zinc-600 font-normal">
                              {rec.date}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Character visual indicator */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
                      <span>MASK IN USE:</span>
                      <span className="text-white font-bold">
                        {SKINS.find(s => s.id === options.selectedSkinId)?.name.split(' ')[0] || 'ชาดคลาสสิก'}
                      </span>
                    </div>
                    <div 
                      className="w-4 h-5 rounded-none"
                      style={{ 
                        backgroundColor: SKINS.find(s => s.id === options.selectedSkinId)?.color || '#dc2626',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="w-full max-w-3xl flex justify-between items-end text-zinc-600 mt-12 pt-6 border-t border-zinc-900/40 font-kanit">
                <div className="text-[9px] uppercase tracking-[0.3em] font-light">
                  Ver 1.2.5-Stable // 2026 Build
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-right font-light leading-relaxed">
                  Developed by <br/> <span className="text-zinc-500 font-bold">Studio Loei Arts</span>
                </div>
              </div>
            </motion.div>
          )}

          {screen === GameScreen.PLAYING && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
              key="playing"
            >
              <GameCanvas
                options={options}
                skins={SKINS}
                onGameOver={handleGameOver}
                onExit={() => setScreen(GameScreen.MENU)}
                onEnding={handleEnding}
              />
            </motion.div>
          )}

          {screen === GameScreen.OPTIONS && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
              key="options"
            >
              <OptionsMenu
                options={options}
                skins={SKINS}
                onOptionsChange={handleSaveOptions}
                onBack={() => setScreen(GameScreen.MENU)}
              />
            </motion.div>
          )}

          {screen === GameScreen.HOW_TO_PLAY && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
              key="howto"
            >
              <HowToPlay
                controls={options.controls}
                onBack={() => setScreen(GameScreen.MENU)}
              />
            </motion.div>
          )}

          {screen === GameScreen.GAME_OVER && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 rounded-sm p-8 text-center font-kanit shadow-2xl backdrop-blur-sm relative overflow-hidden"
              key="gameover"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
              <div className="w-14 h-14 bg-red-950/30 border border-red-700 text-red-500 rounded-none flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse">
                💀
              </div>

              <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase">
                GAME OVER
              </h2>
              <p className="text-zinc-500 text-xs mb-6 uppercase tracking-wider">
                การเดินทางสิ้นสุดลงที่ด่านซ้าย • SPIRIT ENERGY DEPLETED
              </p>

              {/* Score results card */}
              <div className="bg-black/50 border border-zinc-900 p-6 rounded-sm mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                  <span className="text-zinc-400">PLAYER HERO:</span>
                  <span className="font-bold text-white">{currentPlayerName}</span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <span className="text-zinc-400 text-xs uppercase tracking-wider">FINAL SCORE:</span>
                  <span className="text-3xl font-black text-red-500 font-mono animate-pulse">
                    {lastScore}
                  </span>
                </div>
              </div>

              {/* Action buttons with raw contrast look */}
              <div className="space-y-3">
                <button
                  onClick={handleStartGame}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-xs uppercase rounded-none transition-all duration-200 cursor-pointer"
                  id="btn-restart-game"
                >
                  ท้าทายใหม่อีกครั้ง • TRY AGAIN
                </button>

                <button
                  onClick={() => setScreen(GameScreen.MENU)}
                  className="w-full py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-none font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  id="btn-return-menu"
                >
                  กลับสู่หน้าจอหลัก • RETURN HOME
                </button>
              </div>
            </motion.div>
          )}

          {screen === GameScreen.ENDING && (
            <EndingCutscene
              playerName={currentPlayerName}
              score={lastScore || 0}
              selectedSkinId={options.selectedSkinId}
              skins={SKINS}
              onExit={() => setScreen(GameScreen.MENU)}
              soundEnabled={options.soundEnabled}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floating global volume helper for quick control */}
      {screen !== GameScreen.PLAYING && (
        <button
          onClick={() => {
            const nextSound = !options.soundEnabled;
            handleSaveOptions({ ...options, soundEnabled: nextSound, musicEnabled: nextSound });
          }}
          className="fixed bottom-4 right-4 p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors z-30 cursor-pointer"
          title="เสียงเปิด/ปิดดนตรีสากลด่านซ้าย"
          id="btn-global-audio-toggle"
        >
          {options.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      )}
    </div>
  );
}
