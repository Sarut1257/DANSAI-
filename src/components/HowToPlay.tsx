import React from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Shield, Award, MapPin } from 'lucide-react';

interface HowToPlayProps {
  controls: {
    left: string;
    right: string;
    jump: string;
    action: string;
  };
  onBack: () => void;
}

export default function HowToPlay({ controls, onBack }: HowToPlayProps) {
  return (
    <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 font-kanit text-zinc-300 shadow-2xl relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
        <Sparkles className="text-amber-400" size={24} />
        <div>
          <h2 className="text-xl font-extrabold text-white">วิธีการเล่น & ตำนานด่านซ้าย (How to Play)</h2>
          <p className="text-zinc-500 text-xs">สัมผัสวิถีชีวิตและการผจญภัยในแดนประเพณีผีตาโขน</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Lore Intro section */}
        <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900/50">
          <div className="flex gap-2 items-center text-amber-300 font-bold text-sm mb-1.5">
            <MapPin size={16} />
            <span>เรื่องราวด่านซ้าย (Dan Sai Tale)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            ยินดีต้อนรับสู่ <span className="text-white font-medium">อำเภอด่านซ้าย จังหวัดเลย</span> ดินแดนแห่งความศักดิ์สิทธิ์และสีสันแห่งจิตวิญญาณ! ท่านจะได้รับบทเป็นนักรบหน้ากากผู้เข้าร่วมงาน <span className="text-amber-400 font-medium">ประเพณีผีตาโขน (Phi Ta Khon Festival)</span> เพื่อวิ่งข้ามสะพานเชื่อมสัมพันธ์ สะสมหน้ากากศักดิ์สิทธิ์และข้าวเหนียวสมุนไพร เพื่อปลุกเสกพลังอันยิ่งใหญ่ของชุมชนให้สงบร่มเย็น!
          </p>
        </div>

        {/* Controls mapping */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>🎮 การควบคุมสำหรับคุณ</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-900">
              <span className="text-xs text-zinc-400 font-kanit">เลี้ยวซ้าย</span>
              <kbd className="px-2 py-1 bg-zinc-800 text-indigo-400 rounded text-xs border border-zinc-700">{controls.left.toUpperCase()}</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-900">
              <span className="text-xs text-zinc-400 font-kanit">เลี้ยวขวา</span>
              <kbd className="px-2 py-1 bg-zinc-800 text-indigo-400 rounded text-xs border border-zinc-700">{controls.right.toUpperCase()}</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-900">
              <span className="text-xs text-zinc-400 font-kanit">กระโดด / ดับเบิ้ลจัมพ์</span>
              <kbd className="px-2 py-1 bg-zinc-800 text-indigo-400 rounded text-xs border border-zinc-700">{controls.jump.toUpperCase()}</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-900">
              <span className="text-xs text-zinc-400 font-kanit">สไลด์หลบเครื่องกีดขวาง</span>
              <kbd className="px-2 py-1 bg-zinc-800 text-indigo-400 rounded text-xs border border-zinc-700">{controls.action.toUpperCase()}</kbd>
            </div>
          </div>
        </div>

        {/* Collectibles items list */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">✨ สิ่งของนำโชคและเครื่องราง</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
              <div className="w-8 h-8 rounded-md bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 font-mono">
                👹
              </div>
              <div>
                <span className="font-bold text-white block">หน้ากากผีตาโขน (Phi Ta Khon Mask)</span>
                <span className="text-zinc-400 block mt-0.5">รับคะแนน +10 คะแนน ยิ่งสะสมมากหน้ากากยิ่งเพิ่มพลังความสนุก</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
              <div className="w-8 h-8 rounded-md bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-lg text-emerald-400">
                📦
              </div>
              <div>
                <span className="font-bold text-white block">กระติบข้าวเหนียวด่านซ้าย (Sticky Rice Box)</span>
                <span className="text-zinc-400 block mt-0.5">ฟื้นฟูพลังชีวิต +1 หน่วย และเปิดใช้งาน "เกราะสมุนไพรข้าวเหนียว" เพื่อป้องกันดาเมจจากการชน 1 ครั้ง</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
              <div className="w-8 h-8 rounded-md bg-yellow-600/20 border border-yellow-500/40 flex items-center justify-center text-lg text-yellow-400">
                ⭐
              </div>
              <div>
                <span className="font-bold text-white block">หน้ากากทองคำในตำนาน (Legendary Golden Mask)</span>
                <span className="text-zinc-400 block mt-0.5">มอบคะแนนก้อนโต +50 คะแนน พร้อมเพิ่มแต้มทวีคูณ (Multiplier) เป็นสองเท่าชั่วคราว!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Obstacles / Enemies */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">⚠️ สิ่งกีดขวางที่ต้องระวัง</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
              <div className="w-8 h-8 rounded-md bg-red-950 border border-red-800 flex items-center justify-center font-bold text-red-500">
                ▲▲
              </div>
              <div>
                <span className="font-bold text-white block">หนามไม้ไผ่ป่าด่านซ้าย (Bamboo Spikes)</span>
                <span className="text-zinc-400 block mt-0.5">ขวากหนามตามธรรมชาติบนสะพานไม้ไผ่ที่ต้องกระโดดข้ามให้พ้นเพื่อไม่ให้เสียพลังชีวิต</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
              <div className="w-8 h-8 rounded-md bg-purple-950 border border-purple-800 flex items-center justify-center text-lg text-purple-400">
                👻
              </div>
              <div>
                <span className="font-bold text-white block">วิญญาณป่าลึกลับ (Mysterious Forest Spirits)</span>
                <span className="text-zinc-400 block mt-0.5">ลอยเข้ามาปะทะในระดับสูง ต้องกดสไลด์ตัว (<kbd className="bg-zinc-800 px-1 py-0.5 text-purple-400 rounded text-[10px]">{controls.action.toUpperCase()}</kbd>) หรือก้มหลบเท่านั้น</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-zinc-900">
        <span className="text-[10px] text-zinc-600 font-mono">DAN SAI ADVENTURE v1.2</span>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl border border-zinc-800 transition-all cursor-pointer"
          id="btn-howtoplay-back"
        >
          <ArrowLeft size={16} />
          <span>กลับสู่เมนูหลัก</span>
        </button>
      </div>
    </div>
  );
}
