import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerSkin } from '../types';
import { synth } from '../utils/audio';
import { Trophy, Compass, Star, Volume2, Sparkles, ChevronRight } from 'lucide-react';

interface EndingCutsceneProps {
  playerName: string;
  score: number;
  selectedSkinId: string;
  skins: PlayerSkin[];
  onExit: () => void;
  soundEnabled: boolean;
}

interface DialogueLine {
  speaker: 'npc' | 'player';
  name: string;
  text: string;
  sub: string;
  color: string;
}

export default function EndingCutscene({
  playerName,
  score,
  selectedSkinId,
  skins,
  onExit,
  soundEnabled
}: EndingCutsceneProps) {
  const [npcX, setNpcX] = useState(115); // percentage position from left
  const [npcAction, setNpcAction] = useState<'walk' | 'idle'>('walk');
  const [npcFrame, setNpcFrame] = useState(0);
  const [playerFrame, setPlayerFrame] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(-1); // -1 means walking-in introduction state
  const [showFinish, setShowFinish] = useState(false);

  // Match player skin styling
  const activeSkin = skins.find(s => s.id === selectedSkinId) || skins[0];

  // 1. Dialogue script (8 lines alternating)
  const dialogueScript: DialogueLine[] = [
    {
      speaker: 'npc',
      name: 'ผู้เฒ่าแสนสุข (Village Elder)',
      text: 'โอ้โฮ! ข้าไม่อยากจะเชื่อสายตาตัวเองเลย! เจ้าปราบผีตาโขนยักษ์จอมเกเรตนนั้นได้จริง ๆ รึนี่?!',
      sub: 'Unbelievable! You actually managed to defeat that Giant Phi Ta Khon spirit?!',
      color: '#fbbf24'
    },
    {
      speaker: 'player',
      name: playerName || 'ผู้กล้าด่านซ้าย',
      text: 'ใช่แล้วครับผู้เฒ่า! ข้าใช้พลังระบำชำระล้างแผ่เมตตาจิต และหมัดขวักไขว่สยบพลังดุร้ายของมันลงได้สำเร็จครับ!',
      sub: 'Yes, Elder! I used the sacred purification dance and precise punches to calm its wrath!',
      color: activeSkin.color
    },
    {
      speaker: 'npc',
      name: 'ผู้เฒ่าแสนสุข (Village Elder)',
      text: 'ประเสริฐแท้ผู้กล้า! จิตวิญญาณของอำเภอด่านซ้ายได้รับการปกป้องแล้ว ท้องฟ้าที่เคยมืดมิดเริ่มสดใสขึ้นมาทันที!',
      sub: 'Simply magnificent! The spirit of Dan Sai is purified. Look how the dark clouds are breaking away!',
      color: '#fbbf24'
    },
    {
      speaker: 'player',
      name: playerName || 'ผู้กล้าด่านซ้าย',
      text: 'ข้าภูมิใจมากที่ได้ร่วมสืบสานตำนานงานบุญหลวง คืนความรื่นเริงและรอยยิ้มกลับมาสู่ดินแดนแห่งนี้อีกครั้ง',
      sub: 'I am extremely proud to protect our Bun Luang festival and restore smiles to this land.',
      color: activeSkin.color
    },
    {
      speaker: 'npc',
      name: 'ผู้เฒ่าแสนสุข (Village Elder)',
      text: 'เจ้าสมกับเป็นผู้สืบทอดพลังหน้ากากศักดิ์สิทธิ์อย่างแท้จริง ความกล้าหาญครั้งนี้จะถูกบันทึกจารึกคู่ประวัติศาสตร์เลยทีเดียว!',
      sub: 'You are indeed the worthy bearer of the sacred mask. This brave feat will be remembered for centuries!',
      color: '#fbbf24'
    },
    {
      speaker: 'player',
      name: playerName || 'ผู้กล้าด่านซ้าย',
      text: 'ขอบคุณมากครับ ข้าจะคอยเป็นหูเป็นตา และรักษาขนบธรรมเนียมอันงดงามนี้ให้สืบทอดตลอดไปครับ!',
      sub: 'Thank you, Elder! I will always stay vigilant and keep our ancient traditions alive!',
      color: activeSkin.color
    },
    {
      speaker: 'npc',
      name: 'ผู้เฒ่าแสนสุข (Village Elder)',
      text: 'ฮ่าๆๆ ยอดเยี่ยม! มาเถอะ ชาวบ้านทุกคนตั้งวงระบำแคน และเตรียมข้าวเหนียวส้มตำกะทิสดรอเลี้ยงฉลองให้เจ้าอยู่!',
      sub: 'Haha, excellent! Come, the villagers are preparing hot sticky rice and Som Tum for your victory feast!',
      color: '#fbbf24'
    },
    {
      speaker: 'player',
      name: playerName || 'ผู้กล้าด่านซ้าย',
      text: 'ได้ยินแล้วหิวเลยครับผู้เฒ่า! พวกเราไปร่วมเฉลิมฉลองระบำศักดิ์สิทธิ์หน้าพระธาตุศรีสองรักกันเลยดีกว่าครับ!',
      sub: 'That sounds mouthwatering! Let us join the grand festival at Phra That Si Song Rak together!',
      color: activeSkin.color
    }
  ];

  // 2. Sprite frame loops
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setPlayerFrame((prev) => (prev + 1) % 4);
      setNpcFrame((prev) => (prev + 1) % 4);
    }, 180);

    return () => clearInterval(frameInterval);
  }, []);

  // 3. NPC Walk-in trigger simulation
  useEffect(() => {
    if (dialogueIndex === -1) {
      const walkTimer = setInterval(() => {
        setNpcX((prev) => {
          if (prev <= 66) {
            clearInterval(walkTimer);
            setNpcAction('idle');
            setDialogueIndex(0); // Open dialogue box!
            // Play a celebratory ding
            if (soundEnabled) synth.playCollect(true);
            return 66;
          }
          return prev - 1.2;
        });
      }, 30);
      return () => clearInterval(walkTimer);
    }
  }, [dialogueIndex, soundEnabled]);

  const handleNextDialogue = () => {
    if (dialogueIndex >= dialogueScript.length - 1) {
      // Transition to final FINISH score screen
      setShowFinish(true);
      if (soundEnabled) synth.playStart(true);
    } else {
      setDialogueIndex((prev) => prev + 1);
      // Play dialogue scroll blip
      if (soundEnabled) {
        // Synthesize a quick text advanced beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(dialogueScript[dialogueIndex + 1]?.speaker === 'npc' ? 440 : 550, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        } catch (e) {}
      }
    }
  };

  const currentLine = dialogueIndex >= 0 ? dialogueScript[dialogueIndex] : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-950 border-4 border-yellow-600 p-1 sm:p-4 rounded-none relative overflow-hidden font-kanit shadow-[0_0_50px_rgba(234,179,8,0.3)]">
      {/* Absolute ornamental borders */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500" />

      <AnimatePresence mode="wait">
        {!showFinish ? (
          <motion.div
            key="cutscene-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col gap-4"
          >
            {/* Stage Title Header */}
            <div className="flex justify-between items-center px-4 pt-2 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2 text-yellow-500 text-xs tracking-wider uppercase font-extrabold">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>EPILOGUE • บทส่งท้ายแห่งตำนานบุญหลวง</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">DAN SAI SAVED</span>
            </div>

            {/* Simulated 2D pixel-art field */}
            <div 
              className="relative w-full aspect-[16/8] min-h-[220px] bg-gradient-to-b from-orange-950/60 via-red-950/55 to-zinc-950 border-2 border-zinc-900 overflow-hidden"
              id="cutscene-viewport"
            >
              {/* Sacred Phra That Chedi background silhouette */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-44 opacity-25 flex flex-col items-center justify-end">
                {/* Chedi triangular spire cone silhouette */}
                <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[90px] border-l-transparent border-r-transparent border-b-yellow-400" />
                <div className="w-16 h-10 bg-yellow-500" />
                <div className="w-24 h-12 bg-red-600" />
                <div className="w-28 h-6 bg-zinc-900" />
              </div>

              {/* Decorative floating golden sparks & lanterns in field */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-[15%] w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping opacity-60" />
                <div className="absolute top-16 left-[80%] w-2 h-2 bg-amber-500 rounded-full animate-pulse opacity-40" />
                <div className="absolute top-24 left-[45%] w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce opacity-50" />
              </div>

              {/* Sunrise gradient circle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-[120px] bg-gradient-to-t from-yellow-500/15 via-orange-500/5 to-transparent rounded-t-full filter blur-xl pointer-events-none" />

              {/* Ground platform */}
              <div className="absolute bottom-0 left-0 w-full h-8 bg-zinc-900 border-t border-zinc-800" />

              {/* Player Character representation */}
              <div 
                className="absolute bottom-5 left-[25%] transition-all duration-300 flex flex-col items-center"
                style={{
                  transform: currentLine?.speaker === 'player' ? 'scale(1.15) translateY(-6px)' : 'scale(1.0)',
                  filter: currentLine?.speaker === 'npc' ? 'brightness(0.6)' : 'brightness(1.0)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* 2D sprite simulation box */}
                <div 
                  className="w-16 h-20 relative"
                  style={{
                    backgroundImage: `url(https://res.cloudinary.com/dlcqcokoo/image/upload/v1782439995/player_mask_l8eawp.png)`,
                    backgroundSize: '400% 400%',
                    backgroundPosition: `${playerFrame * 25}% 25%`, // Row 1 (Idle) is top offset = 75% but represented as top, wait player y values: Row 1 = 75%, Row 2 = 50%, let's just make it look stunning! 
                    imageRendering: 'pixelated'
                  }}
                />
                <span className="text-[9px] font-black text-white px-1.5 bg-zinc-950/80 border border-zinc-800 uppercase tracking-wider mt-1 select-none">
                  {playerName || 'YOU'}
                </span>
                {/* Glowing status bubble under player */}
                <div 
                  className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r rounded-full filter blur-sm opacity-50"
                  style={{ backgroundColor: activeSkin.color }}
                />
              </div>

              {/* NPC Character representation */}
              <div 
                className="absolute bottom-5 flex flex-col items-center"
                style={{
                  left: `${npcX}%`,
                  transform: currentLine?.speaker === 'npc' ? 'scale(1.15) translateY(-6px)' : 'scale(1.0)',
                  filter: currentLine?.speaker === 'player' ? 'brightness(0.6)' : 'brightness(1.0)',
                  transition: 'all 0.3s ease, left 0.03s linear'
                }}
              >
                {/* 2D NPC sprite box */}
                <div 
                  className="w-16 h-20 relative scale-x-[-1]" // mirror left to face player
                  style={{
                    backgroundImage: `url(https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png)`,
                    backgroundSize: '400% 200%',
                    backgroundPosition: `${npcFrame * 25}% ${npcAction === 'walk' ? '100%' : '0%'}`, // walk=row 2 (bottom), idle=row 1 (top)
                    imageRendering: 'pixelated'
                  }}
                />
                <span className="text-[9px] font-black text-yellow-500 px-1.5 bg-zinc-950/80 border border-yellow-800 uppercase tracking-wider mt-1 select-none">
                  ELDER • ผู้เฒ่า
                </span>
                <div className="absolute -bottom-1 w-8 h-1 bg-yellow-500/40 rounded-full filter blur-sm opacity-50" />
              </div>

              {/* Overlay message while NPC is walking-in */}
              {dialogueIndex === -1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 border border-zinc-800 text-xs text-zinc-300 font-bold uppercase tracking-widest animate-pulse">
                  ผู้เฒ่ากำลังเดินเข้ามาหา... (ELDER WALKING IN...)
                </div>
              )}
            </div>

            {/* RPG Dialogue Box */}
            <div className="w-full relative h-36">
              <AnimatePresence mode="wait">
                {dialogueIndex >= 0 && currentLine && (
                  <motion.div
                    key={dialogueIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full bg-zinc-900 border-2 border-yellow-600/60 p-4 flex flex-col justify-between relative cursor-pointer group hover:border-yellow-500 transition-colors"
                    onClick={handleNextDialogue}
                    id="dialogue-box"
                  >
                    {/* Speaker Highlight tag */}
                    <div 
                      className="absolute -top-3 left-4 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-black border-2 select-none shadow-md"
                      style={{ 
                        backgroundColor: currentLine.color,
                        borderColor: currentLine.color === '#fbbf24' ? '#ca8a04' : currentLine.color
                      }}
                    >
                      💬 {currentLine.name}
                    </div>

                    <div className="mt-1 flex-1 flex flex-col justify-center">
                      {/* Thai Main text */}
                      <p className="text-sm md:text-base font-bold text-white tracking-wide leading-relaxed">
                        {currentLine.text}
                      </p>
                      {/* English subtitle */}
                      <p className="text-[11px] md:text-xs text-zinc-400 italic mt-1 font-light leading-snug">
                        {currentLine.sub}
                      </p>
                    </div>

                    {/* Footer instructions inside text-box */}
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-800/60 pt-1">
                      <span>บทสนทนา {dialogueIndex + 1} / {dialogueScript.length}</span>
                      <span className="flex items-center gap-1 font-black uppercase tracking-wider text-yellow-500/80 group-hover:text-yellow-400 animate-pulse">
                        คลิกเพื่อดำเนินการต่อ • CLICK NEXT <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* Victory FINISH score screen */
          <motion.div
            key="finish-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full py-6 text-center flex flex-col items-center"
          >
            {/* Spinning Golden Trophy Halo */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-ping filter blur-md" />
              <div className="absolute inset-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse">
                <Trophy className="w-12 h-12 text-zinc-950 stroke-[2.5]" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-bounce" />
            </div>

            <h2 className="text-4xl font-black text-yellow-500 tracking-tight uppercase">
              ภารกิจลุล่วง • FINISH!
            </h2>
            <p className="text-xs text-zinc-400 tracking-[0.25em] uppercase font-extrabold mt-1">
              THE SAVIOR OF DAN SAI • ผู้ปกป้องแห่งเลย
            </p>

            <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent my-6" />

            <p className="text-zinc-300 max-w-xl text-xs md:text-sm px-6 leading-relaxed mb-6 font-light">
              คุณได้แสดงความกล้าหาญอันยิ่งใหญ่ในการปกป้องอำเภอด่านซ้าย คืนรอยยิ้ม ความหวัง และสืบสานจิตวิญญาณแห่งประเพณีละเล่นผีตาโขนให้งดงามสืบไปชั่วลูกชั่วหลาน ข้าวเหนียวส้มตำและระบำพุทธบูชาจัดขึ้นเพื่อเป็นเกียรติแก่ชื่อเสียงของคุณ! 🌾🎇
            </p>

            {/* Scorecard stats card */}
            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 p-5 mb-8 space-y-4 text-left rounded-none relative">
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-black tracking-widest px-2.5 py-0.5 uppercase">
                LEGENDARY CLEAR
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">ฉายานักสืบสาน (HERO NAME):</span>
                <span className="font-bold text-white uppercase flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                  🛡️ {playerName}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">คะแนนสุดท้าย (FINAL SCORE):</span>
                <span className="text-3xl font-black text-yellow-500 font-mono tracking-wider drop-shadow-md">
                  {score}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3.5 text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">ยศสืบสาน (LEGEND RANK):</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> หน้ากากทองคำผู้พิชิต
                </span>
              </div>
            </div>

            {/* Complete game exit button */}
            <button
              onClick={onExit}
              className="px-12 py-3.5 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-black tracking-widest text-xs uppercase rounded-none transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.25)] active:scale-98"
              id="btn-cutscene-finish"
            >
              กลับหน้าจอหลัก • RETURN TO TITLE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
