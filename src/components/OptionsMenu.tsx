import React, { useState, useEffect } from 'react';
import { GameOptions, PlayerSkin } from '../types';
import { 
  Keyboard, 
  Volume2, 
  VolumeX, 
  Music, 
  Gauge, 
  Palette, 
  Settings, 
  Check, 
  HelpCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface OptionsMenuProps {
  options: GameOptions;
  skins: PlayerSkin[];
  onOptionsChange: (newOptions: GameOptions) => void;
  onBack: () => void;
}

export default function OptionsMenu({ options, skins, onOptionsChange, onBack }: OptionsMenuProps) {
  const [activeBindingKey, setActiveBindingKey] = useState<string | null>(null);

  // Handle keyboard capture when rebinding a control key
  useEffect(() => {
    if (!activeBindingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      // Avoid binding modifier keys like Shift/Alt/Control unless standard
      if (['shift', 'control', 'alt', 'meta'].includes(e.key.toLowerCase())) {
        return;
      }

      const newKey = e.key === ' ' ? 'Space' : e.key;
      const updatedControls = { ...options.controls, [activeBindingKey]: newKey };
      
      onOptionsChange({
        ...options,
        controls: updatedControls
      });
      setActiveBindingKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeBindingKey, options, onOptionsChange]);

  const toggleSound = () => {
    onOptionsChange({ ...options, soundEnabled: !options.soundEnabled });
  };

  const toggleMusic = () => {
    onOptionsChange({ ...options, musicEnabled: !options.musicEnabled });
  };

  const toggleOnScreenButtons = () => {
    onOptionsChange({ ...options, showOnScreenButtons: !options.showOnScreenButtons });
  };

  const handleDifficulty = (difficulty: 'easy' | 'normal' | 'hard') => {
    onOptionsChange({ ...options, difficulty });
  };

  const selectSkin = (skinId: string) => {
    onOptionsChange({ ...options, selectedSkinId: skinId });
  };

  return (
    <div className="w-full max-w-3xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 md:p-8 font-kanit text-zinc-200 shadow-2xl relative overflow-hidden">
      {/* Decorative firefly background elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-900/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-900/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
        <Settings className="text-indigo-400 animate-spin-slow" size={28} />
        <div>
          <h2 className="text-2xl font-black tracking-wide text-white">
            การปรับแต่งตั้งค่า (OPTIONS)
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            ปรับปุ่มการบังคับ, สีหน้ากากตัวละคร และระบบเสียงของเกม Dan Sai Adventure
          </p>
        </div>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Side: Controls Customizer */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <Keyboard size={20} className="text-indigo-400" />
            <span>ปรับปุ่มบังคับตัวละคร</span>
          </div>

          <div className="bg-black/50 border border-zinc-900 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">เลี้ยวซ้าย (Move Left)</span>
              <button
                onClick={() => setActiveBindingKey('left')}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all min-w-24 text-center border ${
                  activeBindingKey === 'left'
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border-zinc-800'
                }`}
                id="btn-bind-left"
              >
                {activeBindingKey === 'left' ? 'กดปุ่มใหม่...' : options.controls.left.toUpperCase()}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">เลี้ยวขวา (Move Right)</span>
              <button
                onClick={() => setActiveBindingKey('right')}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all min-w-24 text-center border ${
                  activeBindingKey === 'right'
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border-zinc-800'
                }`}
                id="btn-bind-right"
              >
                {activeBindingKey === 'right' ? 'กดปุ่มใหม่...' : options.controls.right.toUpperCase()}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">กระโดด (Jump)</span>
              <button
                onClick={() => setActiveBindingKey('jump')}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all min-w-24 text-center border ${
                  activeBindingKey === 'jump'
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border-zinc-800'
                }`}
                id="btn-bind-jump"
              >
                {activeBindingKey === 'jump' ? 'กดปุ่มใหม่...' : options.controls.jump.toUpperCase()}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">สไลด์ตัว (Slide)</span>
              <button
                onClick={() => setActiveBindingKey('action')}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all min-w-24 text-center border ${
                  activeBindingKey === 'action'
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border-zinc-800'
                }`}
                id="btn-bind-action"
              >
                {activeBindingKey === 'action' ? 'กดปุ่มใหม่...' : options.controls.action.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-900">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} className="text-emerald-400" />
              <div>
                <span className="text-sm text-white font-bold block">ปุ่มควบคุมบนหน้าจอ (On-Screen Controls)</span>
                <span className="text-zinc-500 text-[11px] block">แสดงปุ่มสัมผัสเสมือนจำลองที่ด้านล่าง</span>
              </div>
            </div>
            <button
              onClick={toggleOnScreenButtons}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                options.showOnScreenButtons ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
              id="btn-toggle-onscreen"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  options.showOnScreenButtons ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Side: Skins & Sound settings */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <Palette size={20} className="text-red-400" />
            <span>เลือกหน้ากาก/สีตัวละคร (Skins)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {skins.map((skin) => (
              <button
                key={skin.id}
                onClick={() => selectSkin(skin.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  options.selectedSkinId === skin.id
                    ? 'bg-zinc-900 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                }`}
                id={`btn-select-skin-${skin.id}`}
              >
                {/* Mini color representation */}
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-5 h-5 rounded-md flex items-center justify-center font-bold"
                    style={{ backgroundColor: skin.color, boxShadow: `0 0 10px ${skin.glowColor}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{skin.name}</span>
                    <span className="text-[10px] text-zinc-500 block">ความเร็ว x{skin.speedMultiplier}</span>
                  </div>
                </div>

                {options.selectedSkinId === skin.id && (
                  <div className="absolute top-1 right-1 bg-indigo-600 rounded-full p-0.5 text-white">
                    <Check size={10} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Sound, Music & Difficulty toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">เสียงเอฟเฟกต์ (SFX)</span>
              </div>
              <button
                onClick={toggleSound}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  options.soundEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
                }`}
                id="btn-toggle-sfx"
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${
                    options.soundEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">ดนตรีประกอบ (Music)</span>
              </div>
              <button
                onClick={toggleMusic}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  options.musicEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
                }`}
                id="btn-toggle-bgm"
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${
                    options.musicEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">ระดับความยาก (Difficulty)</span>
              </div>
              <div className="flex gap-1 bg-black/60 p-1 rounded-lg border border-zinc-900">
                {(['easy', 'normal', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficulty(diff)}
                    className={`px-2.5 py-1 text-xs rounded transition-all capitalize font-semibold ${
                      options.difficulty === diff
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    id={`btn-diff-${diff}`}
                  >
                    {diff === 'easy' ? 'ง่าย' : diff === 'normal' ? 'ปกติ' : 'ยาก'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div className="flex gap-3 bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 mb-6">
        <HelpCircle size={20} className="text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 leading-relaxed">
          <p className="font-semibold text-zinc-300 mb-1">วิธีการเปลี่ยนปุ่มบังคับตัวละคร:</p>
          คลิกที่ปุ่ม <span className="text-indigo-300 font-mono">ตัวอักษร</span> สีฟ้าน้ำเงินทางซ้าย แล้วกดปุ่มใหม่ใดๆ บนคีย์บอร์ดที่ท่านต้องการ เพื่อตั้งค่าปุ่มตามใจชอบ ระบบจะบันทึกค่าไว้ให้ทันที!
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4 border-t border-zinc-900">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white text-sm font-bold tracking-wider rounded-xl transition-all"
          id="btn-save-options"
        >
          บันทึกและกลับสู่เมนูหลัก
        </button>
      </div>
    </div>
  );
}
