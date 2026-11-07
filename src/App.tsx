/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Equipment, Gem, HeroCalculatedStats, EquipmentType, StageConfig } from './types/game';
import { PRESET_GEMS, INITIAL_EQUIPMENTS } from './data/initialData';
import { generateAllStages } from './data/stagesData';
import { calculateHeroStats } from './utils/calcStats';
import { HeroCharacterCard } from './components/HeroCharacterCard';
import { GemBag } from './components/GemBag';
import { BattleArena } from './components/BattleArena';
import { SocketModal } from './components/SocketModal';
import { ChangeEquipmentModal } from './components/ChangeEquipmentModal';
import { StageSelectModal } from './components/StageSelectModal';
import { TitleScreen } from './components/TitleScreen';
import { QuitScreen } from './components/QuitScreen';
import { TestingTools } from './components/TestingTools';
import { AudioControls } from './components/AudioControls';
import { storageService } from './services/storage';
import { Sparkles, Map, LogOut } from 'lucide-react';
import { sounds } from './services/sound';

export default function App() {
  // Game State Machine: 'TITLE' | 'PLAYING' | 'EXITED'
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING' | 'EXITED'>('TITLE');

  // 12 Stages Configuration
  const [stages, setStages] = useState<StageConfig[]>(() => generateAllStages());
  const [unlockedStageMax, setUnlockedStageMax] = useState<number>(1);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [currentWaveIndex, setCurrentWaveIndex] = useState<number>(0);

  // Gems in player bag
  const [gems, setGems] = useState<Gem[]>([...PRESET_GEMS]);

  // Equipped Gear
  const [equipped, setEquipped] = useState<{
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  }>({
    weapon: INITIAL_EQUIPMENTS[0] ? JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[0])) : null,
    armor: INITIAL_EQUIPMENTS[1] ? JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[1])) : null,
    accessory: INITIAL_EQUIPMENTS[2] ? JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[2])) : null,
  });

  // Unequipped Gear in Inventory
  const [inventoryEquipments, setInventoryEquipments] = useState<Equipment[]>(() =>
    INITIAL_EQUIPMENTS.slice(3).map((item) => JSON.parse(JSON.stringify(item)))
  );

  // Dynamic hero stats
  const heroStats: HeroCalculatedStats = useMemo(() => {
    return calculateHeroStats(equipped);
  }, [equipped]);

  // Current HP
  const [currentHp, setCurrentHp] = useState<number>(heroStats.maxHp);

  // Modals
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [socketModal, setSocketModal] = useState<{
    isOpen: boolean;
    equipment: Equipment | null;
    socketIndex: number | null;
  }>({
    isOpen: false,
    equipment: null,
    socketIndex: null,
  });

  const [changeEquipModal, setChangeEquipModal] = useState<{
    isOpen: boolean;
    slotType: EquipmentType | null;
  }>({
    isOpen: false,
    slotType: null,
  });

  const [stageSelectModalOpen, setStageSelectModalOpen] = useState(false);

  // Auto-Save whenever gear, gems, or progress changes during PLAYING state
  useEffect(() => {
    if (gameState === 'PLAYING') {
      storageService.saveGame({
        gems,
        equipped,
        inventoryEquipments,
        currentStageIndex,
        currentWaveIndex,
        unlockedStageMax,
      });
    }
  }, [gems, equipped, inventoryEquipments, currentStageIndex, currentWaveIndex, unlockedStageMax, gameState]);

  // Title Screen Actions: 繼續遊戲 (若無存檔則在 TitleScreen 內隱藏)
  const handleContinueGame = () => {
    const save = storageService.loadSaveGame();
    if (save) {
      setGems(save.gems);
      setEquipped(save.equipped);
      setInventoryEquipments(save.inventoryEquipments);
      setCurrentStageIndex(save.currentStageIndex || 0);
      setCurrentWaveIndex(save.currentWaveIndex || 0);
      const maxUnlocked = save.unlockedStageMax || 1;
      setUnlockedStageMax(maxUnlocked);
      setStages((prev) =>
        prev.map((stg, sIdx) => ({
          ...stg,
          unlocked: sIdx + 1 <= maxUnlocked,
          cleared: sIdx + 1 < maxUnlocked,
        }))
      );
      const computed = calculateHeroStats(save.equipped);
      setCurrentHp(computed.maxHp);
    }
    setGameState('PLAYING');
  };

  // Title Screen: 直接開啟選關畫面
  const handleOpenStageSelectFromTitle = () => {
    handleContinueGame();
    setStageSelectModalOpen(true);
  };

  // Title Screen Actions: 新遊戲 (開新存檔)
  const handleNewGame = () => {
    storageService.deleteSaveGame();
    const freshStages = generateAllStages();
    setStages(freshStages);
    setUnlockedStageMax(1);
    setCurrentStageIndex(0);
    setCurrentWaveIndex(0);
    setGems([...PRESET_GEMS]);
    const initEquipped = {
      weapon: JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[0])),
      armor: JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[1])),
      accessory: JSON.parse(JSON.stringify(INITIAL_EQUIPMENTS[2])),
    };
    setEquipped(initEquipped);
    const initInv = INITIAL_EQUIPMENTS.slice(3).map((item) => JSON.parse(JSON.stringify(item)));
    setInventoryEquipments(initInv);
    const computed = calculateHeroStats(initEquipped);
    setCurrentHp(computed.maxHp);

    storageService.saveGame({
      gems: PRESET_GEMS,
      equipped: initEquipped,
      inventoryEquipments: initInv,
      currentStageIndex: 0,
      currentWaveIndex: 0,
      unlockedStageMax: 1,
    });

    setGameState('PLAYING');
  };

  // Title Screen Actions: 退出 (關閉網頁)
  const handleExitGame = () => {
    setGameState('EXITED');
  };

  // Stage & Wave Advancements
  const handleWaveAdvance = (nextWaveIndex: number) => {
    setCurrentWaveIndex(nextWaveIndex);
  };

  // 擊敗第 12 波大首領，解鎖下一關卡 (上一關通關才解鎖下一關)
  const handleStageClear = (clearedStageIndex: number) => {
    const nextMax = Math.min(12, Math.max(unlockedStageMax, clearedStageIndex + 2));
    setUnlockedStageMax(nextMax);
    setStages((prev) =>
      prev.map((stg, sIdx) => ({
        ...stg,
        unlocked: sIdx + 1 <= nextMax,
        cleared: sIdx <= clearedStageIndex,
      }))
    );
  };

  const handleSelectStage = (stageIdx: number) => {
    if (stageIdx + 1 > unlockedStageMax) return;
    setCurrentStageIndex(stageIdx);
    setCurrentWaveIndex(0);
    setCurrentHp(heroStats.maxHp);
  };

  // 測試輔助：手動解鎖下一關
  const handleUnlockNextStage = () => {
    const next = Math.min(12, unlockedStageMax + 1);
    setUnlockedStageMax(next);
    setStages((prev) =>
      prev.map((s, idx) => ({
        ...s,
        unlocked: idx + 1 <= next,
        cleared: idx + 1 < next,
      }))
    );
  };

  // Open Change Equipment Modal
  const handleOpenChangeEquipment = (slotType: EquipmentType) => {
    setChangeEquipModal({
      isOpen: true,
      slotType,
    });
  };

  // Socket Gem
  const handleSocketGem = (equipmentId: string, socketIndex: number, gemToSocket: Gem) => {
    let foundInEquipped = false;
    let oldGem: Gem | null = null;

    setEquipped((prev) => {
      const updated = { ...prev };
      for (const slotKey of ['weapon', 'armor', 'accessory'] as const) {
        const item = updated[slotKey];
        if (item && item.id === equipmentId) {
          foundInEquipped = true;
          oldGem = item.sockets[socketIndex] || null;
          const newSockets = [...item.sockets];
          newSockets[socketIndex] = gemToSocket;
          updated[slotKey] = { ...item, sockets: newSockets };
        }
      }
      return updated;
    });

    if (!foundInEquipped) {
      setInventoryEquipments((prev) =>
        prev.map((item) => {
          if (item.id === equipmentId) {
            oldGem = item.sockets[socketIndex] || null;
            const newSockets = [...item.sockets];
            newSockets[socketIndex] = gemToSocket;
            return { ...item, sockets: newSockets };
          }
          return item;
        })
      );
    }

    setGems((prev) => {
      const filtered = prev.filter((g) => g.id !== gemToSocket.id);
      if (oldGem) {
        return [...filtered, oldGem];
      }
      return filtered;
    });
  };

  // Unsocket Gem (100% Preserved)
  const handleUnsocketGem = (equipmentId: string, socketIndex: number) => {
    let unsocketedGem: Gem | null = null;

    setEquipped((prev) => {
      const updated = { ...prev };
      for (const slotKey of ['weapon', 'armor', 'accessory'] as const) {
        const item = updated[slotKey];
        if (item && item.id === equipmentId) {
          unsocketedGem = item.sockets[socketIndex];
          const newSockets = [...item.sockets];
          newSockets[socketIndex] = null;
          updated[slotKey] = { ...item, sockets: newSockets };
        }
      }
      return updated;
    });

    setInventoryEquipments((prev) =>
      prev.map((item) => {
        if (item.id === equipmentId) {
          unsocketedGem = item.sockets[socketIndex];
          const newSockets = [...item.sockets];
          newSockets[socketIndex] = null;
          return { ...item, sockets: newSockets };
        }
        return item;
      })
    );

    if (unsocketedGem) {
      setGems((prev) => [...prev, unsocketedGem!]);
    }
  };

  // Unsocket ALL gems from one equipment
  const handleUnsocketAllGems = (equipmentId: string) => {
    const unsocketedGems: Gem[] = [];

    setEquipped((prev) => {
      const updated = { ...prev };
      for (const slotKey of ['weapon', 'armor', 'accessory'] as const) {
        const item = updated[slotKey];
        if (item && item.id === equipmentId) {
          item.sockets.forEach((g) => {
            if (g) unsocketedGems.push(g);
          });
          const newSockets = new Array(item.maxSockets).fill(null);
          updated[slotKey] = { ...item, sockets: newSockets };
        }
      }
      return updated;
    });

    setInventoryEquipments((prev) =>
      prev.map((item) => {
        if (item.id === equipmentId) {
          item.sockets.forEach((g) => {
            if (g) unsocketedGems.push(g);
          });
          const newSockets = new Array(item.maxSockets).fill(null);
          return { ...item, sockets: newSockets };
        }
        return item;
      })
    );

    if (unsocketedGems.length > 0) {
      setGems((prev) => [...prev, ...unsocketedGems]);
    }
  };

  // Unsocket ALL gems across ALL equipped gear
  const handleUnsocketAllEquippedGems = () => {
    const unsocketedGems: Gem[] = [];

    setEquipped((prev) => {
      const updated = { ...prev };
      for (const slotKey of ['weapon', 'armor', 'accessory'] as const) {
        const item = updated[slotKey];
        if (item) {
          item.sockets.forEach((g) => {
            if (g) unsocketedGems.push(g);
          });
          updated[slotKey] = {
            ...item,
            sockets: new Array(item.maxSockets).fill(null),
          };
        }
      }
      return updated;
    });

    if (unsocketedGems.length > 0) {
      setGems((prev) => [...prev, ...unsocketedGems]);
    }
  };

  // Equip Equipment
  const handleEquip = (equipmentToEquip: Equipment) => {
    const slotKey = equipmentToEquip.type as 'weapon' | 'armor' | 'accessory';
    const currentEquippedItem = equipped[slotKey];

    sounds.playEquip();

    setEquipped((prev) => ({
      ...prev,
      [slotKey]: equipmentToEquip,
    }));

    setInventoryEquipments((prev) => {
      const filtered = prev.filter((item) => item.id !== equipmentToEquip.id);
      if (currentEquippedItem) {
        return [...filtered, currentEquippedItem];
      }
      return filtered;
    });
  };

  // Unequip
  const handleUnequip = (equipmentToUnequip: Equipment) => {
    const slotKey = equipmentToUnequip.type as 'weapon' | 'armor' | 'accessory';

    sounds.playEquip();

    setEquipped((prev) => ({
      ...prev,
      [slotKey]: null,
    }));

    setInventoryEquipments((prev) => [...prev, equipmentToUnequip]);
  };

  const handleRequestGemPicker = (equipmentId: string, socketIndex: number) => {
    const target =
      equipped.weapon?.id === equipmentId
        ? equipped.weapon
        : equipped.armor?.id === equipmentId
        ? equipped.armor
        : equipped.accessory?.id === equipmentId
        ? equipped.accessory
        : inventoryEquipments.find((i) => i.id === equipmentId) || null;

    if (target) {
      setSocketModal({
        isOpen: true,
        equipment: target,
        socketIndex,
      });
    }
  };

  const handleRewardReceived = (loot: {
    equipment?: Equipment;
    gem?: Gem;
    gold: number;
    exp: number;
  }) => {
    if (loot.equipment) {
      setInventoryEquipments((prev) => [loot.equipment!, ...prev]);
    }
    if (loot.gem) {
      setGems((prev) => [loot.gem!, ...prev]);
    }
  };

  // Test tools
  const handleAddRandomEquipment = (forcedType?: EquipmentType) => {
    const pool = forcedType
      ? INITIAL_EQUIPMENTS.filter((e) => e.type === forcedType)
      : INITIAL_EQUIPMENTS;
    const template = pool[Math.floor(Math.random() * pool.length)] || INITIAL_EQUIPMENTS[0];

    const newEq: Equipment = {
      ...template,
      id: `eq_custom_${Date.now()}`,
      name: `★ 強化${template.name}`,
      sockets: new Array(template.maxSockets).fill(null),
    };
    setInventoryEquipments((prev) => [newEq, ...prev]);
  };

  const handleAddRandomGem = () => {
    const randomTemplate = PRESET_GEMS[Math.floor(Math.random() * PRESET_GEMS.length)];
    const newGem: Gem = {
      ...randomTemplate,
      id: `gem_custom_${Date.now()}_${Math.random()}`,
    };
    setGems((prev) => [newGem, ...prev]);
  };

  const handleAutoEquipGodSet = () => {
    const statAtk = PRESET_GEMS.find((g) => g.id === 'gem_stat_atk_1') || PRESET_GEMS[0];
    const statCrit = PRESET_GEMS.find((g) => g.id === 'gem_stat_crit_1') || PRESET_GEMS[4];
    const skillThunder = PRESET_GEMS.find((g) => g.id === 'gem_skill_thunder_1') || PRESET_GEMS[12];
    const skillFire = PRESET_GEMS.find((g) => g.id === 'gem_skill_fire_1') || PRESET_GEMS[11];
    const passiveDouble = PRESET_GEMS.find((g) => g.id === 'gem_passive_double_1') || PRESET_GEMS[6];
    const passiveThorns = PRESET_GEMS.find((g) => g.id === 'gem_passive_thorns_1') || PRESET_GEMS[9];
    const passiveFrost = PRESET_GEMS.find((g) => g.id === 'gem_passive_frost_1') || PRESET_GEMS[10];

    const godWeapon: Equipment = {
      ...INITIAL_EQUIPMENTS[4],
      sockets: [
        { ...statAtk, id: `gem_god_1_${Date.now()}` },
        { ...passiveDouble, id: `gem_god_2_${Date.now()}` },
        { ...skillThunder, id: `gem_god_3_${Date.now()}` },
      ],
    };

    const godArmor: Equipment = {
      ...INITIAL_EQUIPMENTS[1],
      sockets: [
        { ...passiveFrost, id: `gem_god_4_${Date.now()}` },
        { ...passiveThorns, id: `gem_god_5_${Date.now()}` },
      ],
    };

    const godAccessory: Equipment = {
      ...INITIAL_EQUIPMENTS[6],
      sockets: [
        { ...statCrit, id: `gem_god_6_${Date.now()}` },
        { ...skillFire, id: `gem_god_7_${Date.now()}` },
      ],
    };

    setEquipped({
      weapon: godWeapon,
      armor: godArmor,
      accessory: godAccessory,
    });
    setCurrentHp(1600);
  };

  const handleFullHeal = () => {
    setCurrentHp(heroStats.maxHp);
  };

  const handleResetAll = () => {
    storageService.deleteSaveGame();
    handleNewGame();
  };

  // View Routing: Title Screen
  if (gameState === 'TITLE') {
    return (
      <TitleScreen
        onContinueGame={handleContinueGame}
        onNewGame={handleNewGame}
        onExitGame={handleExitGame}
        onOpenStageSelect={handleOpenStageSelectFromTitle}
      />
    );
  }

  // View Routing: Quit Screen
  if (gameState === 'EXITED') {
    return <QuitScreen onReturnToTitle={() => setGameState('TITLE')} />;
  }

  // View Routing: Active Play Game View
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Bar (Single-line, sticky, with subtle border and backdrop blur) */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-2.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-base font-bold font-cinzel tracking-wider text-white">
            GemForge
          </span>
          <span className="text-xs text-amber-400 font-mono hidden sm:inline">
            第 {currentStageIndex + 1}/12 關 (波次 {currentWaveIndex + 1}/12)
          </span>

          {/* 關卡選關地圖按鈕 */}
          <button
            onClick={() => setStageSelectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-500/50 text-xs font-bold transition-all shadow-sm ml-1"
            title="開啟 12 關卡選關地圖"
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>選關畫面</span>
          </button>
        </div>

        {/* Center: Compact Testing Tools */}
        <div className="flex-1 max-w-xl mx-2">
          <TestingTools
            onAddRandomEquipment={() => handleAddRandomEquipment()}
            onAddRandomGem={handleAddRandomGem}
            onAutoEquipGodSet={handleAutoEquipGodSet}
            onFullHeal={handleFullHeal}
            onResetAll={handleResetAll}
            onUnlockNextStage={handleUnlockNextStage}
          />
        </div>

        {/* Right: Audio control & Return to Title */}
        <div className="flex items-center gap-2 shrink-0">
          <AudioControls />

          {/* 返回標題按鈕 */}
          <button
            onClick={() => setGameState('TITLE')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="保存進度並返回標題畫面"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">返回標題</span>
          </button>
        </div>
      </header>

      {/* Main Vertically Extended Container: Sufficient Reading Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 pb-16">
        {/* Left Column (5 cols): Battle Arena & Combat Info */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <BattleArena
            heroStats={heroStats}
            currentHp={currentHp}
            setCurrentHp={setCurrentHp}
            stages={stages}
            currentStageIndex={currentStageIndex}
            currentWaveIndex={currentWaveIndex}
            onWaveAdvance={handleWaveAdvance}
            onStageClear={handleStageClear}
            onSelectStage={handleSelectStage}
            onOpenStageSelect={() => setStageSelectModalOpen(true)}
            onRewardReceived={handleRewardReceived}
          />

          {/* Guidance & Strategic Hints Panel (Comfortable Reading Space) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2.5 shadow-lg">
            <div className="font-bold text-amber-300 flex items-center justify-between text-sm pb-1 border-b border-slate-800/80">
              <span>💡 戰略核心指南：</span>
              <span className="text-xs text-slate-400 font-mono">
                每關12波 (第6波中場首領 · 第12波關底大王)
              </span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 font-semibold">💎 裝備寶石懸停效果：</strong>
              滑鼠懸停於下方任一穿戴裝備，即可展開該裝備完整的<strong>「寶石效果明細描述」</strong>（鑲嵌槽常態保持簡約不顯示文字名稱）。
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-sky-400 font-semibold">被動型寶珠：</strong>
              無冷卻時間，每次普通出招或受擊時概率觸發（狂怒連擊、滲透劇毒、極寒霜晶、聖光反傷等）。
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-purple-400 font-semibold">技能型寶珠：</strong>
              帶有獨立冷卻秒數（上方戰鬥畫面有即時 CD 進度列），冷卻完畢下一次攻擊<strong>必定 100% 觸發高額穿透傷與神裁</strong>！
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 font-semibold">100% 拆卸保留：</strong>
              隨時點選孔位或一鍵「全拆保留」，寶石將完整返還背包；點擊<strong>【變更裝備】</strong>可自由挑選庫存神裝。
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Gem Bag atop Equipment with comfortable spacing */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 1. Gem Bag */}
          <div className="shrink-0">
            <GemBag
              gems={gems}
              onSelectGem={(gem) => setSelectedGemId(gem.id)}
              selectedGemId={selectedGemId}
            />
          </div>

          {/* 2. Hero Character Card & Currently Equipped 3 Slots (Weapon, Armor, Accessory) */}
          <div className="w-full">
            <HeroCharacterCard
              equipped={equipped}
              heroStats={heroStats}
              currentHp={currentHp}
              onUnequip={handleUnequip}
              onChangeEquipment={handleOpenChangeEquipment}
              onSocketGem={handleSocketGem}
              onUnsocketGem={handleUnsocketGem}
              onUnsocketAllGems={handleUnsocketAllGems}
              onUnsocketAllEquippedGems={handleUnsocketAllEquippedGems}
              onRequestGemPicker={handleRequestGemPicker}
              allGemsInBag={gems}
            />
          </div>
        </div>
      </main>

      {/* Accessible Socket Picker Modal */}
      <SocketModal
        isOpen={socketModal.isOpen}
        onClose={() => setSocketModal({ isOpen: false, equipment: null, socketIndex: null })}
        equipment={socketModal.equipment}
        socketIndex={socketModal.socketIndex}
        gemsInBag={gems}
        onSelectGem={handleSocketGem}
      />

      {/* Change Equipment Modal */}
      <ChangeEquipmentModal
        isOpen={changeEquipModal.isOpen}
        onClose={() => setChangeEquipModal({ isOpen: false, slotType: null })}
        slotType={changeEquipModal.slotType}
        currentEquipped={
          changeEquipModal.slotType ? equipped[changeEquipModal.slotType] : null
        }
        inventoryEquipments={inventoryEquipments}
        onSelectEquip={handleEquip}
        onAddNewRandomEquipment={() => {
          if (changeEquipModal.slotType) {
            handleAddRandomEquipment(changeEquipModal.slotType);
          }
        }}
      />

      {/* 12-Stage Select Progress Modal */}
      <StageSelectModal
        isOpen={stageSelectModalOpen}
        onClose={() => setStageSelectModalOpen(false)}
        stages={stages}
        currentStageIndex={currentStageIndex}
        currentWaveIndex={currentWaveIndex}
        unlockedStageMax={unlockedStageMax}
        onSelectStage={handleSelectStage}
      />
    </div>
  );
}
