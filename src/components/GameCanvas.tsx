import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameOptions, PlayerSkin } from '../types';
import { synth } from '../utils/audio';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Shield, Award, Sparkles, Trophy } from 'lucide-react';

interface GameCanvasProps {
  options: GameOptions;
  skins: PlayerSkin[];
  onGameOver: (score: number) => void;
  onExit: () => void;
  onEnding: (score: number) => void;
}

export default function GameCanvas({ options, skins, onGameOver, onExit, onEnding }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [soundMuted, setSoundMuted] = useState(!options.soundEnabled);
  const [multiplier, setMultiplier] = useState(1);
  const [showSkillAuraMessage, setShowSkillAuraMessage] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Boss and progression states
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [bossMaxHp] = useState<number>(12);
  const [bossSpawned, setBossSpawned] = useState(false);

  // High performance loop references
  const scoreRef = useRef(0);
  const livesRef = useRef(5);
  const soundMutedRef = useRef(!options.soundEnabled);
  const multiplierRef = useRef(1);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Control inputs state
  const inputsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    dance: false,
  });

  useEffect(() => {
    soundMutedRef.current = soundMuted;
  }, [soundMuted]);

  // Audio start/stop on mount
  useEffect(() => {
    synth.startMusic(!soundMuted);
    return () => {
      synth.stopMusic();
    };
  }, [soundMuted]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const controls = options.controls;

      // Handle ESC key to pause/unpause
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsPaused((prev) => {
          const next = !prev;
          if (next) {
            synth.stopMusic();
          } else {
            synth.startMusic(!soundMutedRef.current);
          }
          return next;
        });
        return;
      }

      // 8-directional movement keys
      if (key === controls.left.toLowerCase() || e.key === 'ArrowLeft') {
        inputsRef.current.left = true;
      }
      if (key === controls.right.toLowerCase() || e.key === 'ArrowRight') {
        inputsRef.current.right = true;
      }
      if (key === controls.jump.toLowerCase() || e.key === 'ArrowUp') {
        inputsRef.current.up = true;
      }
      if (key === controls.action.toLowerCase() || e.key === 'ArrowDown') {
        inputsRef.current.down = true;
      }

      // Attack and Dance keys
      if (key === 'p') {
        inputsRef.current.punch = true;
      }
      if (key === 'o') {
        inputsRef.current.dance = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const controls = options.controls;

      if (key === controls.left.toLowerCase() || e.key === 'ArrowLeft') {
        inputsRef.current.left = false;
      }
      if (key === controls.right.toLowerCase() || e.key === 'ArrowRight') {
        inputsRef.current.right = false;
      }
      if (key === controls.jump.toLowerCase() || e.key === 'ArrowUp') {
        inputsRef.current.up = false;
      }
      if (key === controls.action.toLowerCase() || e.key === 'ArrowDown') {
        inputsRef.current.down = false;
      }
      if (key === 'p') {
        inputsRef.current.punch = false;
      }
      if (key === 'o') {
        inputsRef.current.dance = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [options.controls]);

  // ThreeJS 3D Game Core Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene setup with atmospheric dark midnight sky
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030208');
    scene.fog = new THREE.FogExp2('#030208', 0.04);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 11, 13);

    // Lights
    const ambientLight = new THREE.AmbientLight('#2a1f4d', 0.9); // Deep purple/blue ambient festival glow
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ff7300', 1.4); // Traditional warm golden spotlight
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Add a glowing central orange point light at the holy Stupa
    const centerPointLight = new THREE.PointLight('#ff3a00', 2, 20);
    centerPointLight.position.set(0, 4, 0);
    scene.add(centerPointLight);

    // 1. GROUND PLANE (Size 50 with tiled grass/dirt ground_cja8ml.png)
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(
      'https://res.cloudinary.com/dlcqcokoo/image/upload/v1782439994/ground_cja8ml.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(15, 15); // Small tiling requested
      }
    );
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.9,
    });
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 1.2 INTERACTABLE RANDOM GRASS PATCHES
    const grassTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/grass_2_kjkske.png',
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
      }
    );

    interface GrassPatch {
      mesh: THREE.Mesh;
      targetScaleY: number;
      currentScaleY: number;
    }
    const grassPatches: GrassPatch[] = [];

    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.8
    });
    const grassGeo = new THREE.PlaneGeometry(1.2, 1.2);

    for (let i = 0; i < 45; i++) {
      const gMesh = new THREE.Mesh(grassGeo, grassMat.clone());
      const rx = (Math.random() - 0.5) * 44;
      const rz = (Math.random() - 0.5) * 44;
      
      const finalX = Math.abs(rx) < 5 ? (rx > 0 ? rx + 6 : rx - 6) : rx;
      const finalZ = Math.abs(rz) < 5 ? (rz > 0 ? rz + 6 : rz - 6) : rz;

      gMesh.position.set(finalX, 0.6, finalZ);
      gMesh.receiveShadow = true;
      scene.add(gMesh);

      grassPatches.push({
        mesh: gMesh,
        targetScaleY: 1.0,
        currentScaleY: 1.0
      });
    }

    // 2. CENTRAL LOEI CHEDI (Traditional sacred stupa - Phra That Si Song Rak style)
    const chediGroup = new THREE.Group();
    chediGroup.position.set(0, 0, 0);

    // Chedi Foundation (red and golden stacked tiers)
    const baseTier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.8, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.9 })
    );
    baseTier1.position.y = 0.4;
    baseTier1.castShadow = true;
    baseTier1.receiveShadow = true;
    chediGroup.add(baseTier1);

    const baseTier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 4.2, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.7 }) // Red accents
    );
    baseTier2.position.y = 1.1;
    baseTier2.castShadow = true;
    chediGroup.add(baseTier2);

    const goldBody = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 3.0, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.2, roughness: 0.4 }) // Sacred gold
    );
    goldBody.position.y = 2.1;
    goldBody.castShadow = true;
    chediGroup.add(goldBody);

    const spireCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.0, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.3, roughness: 0.3 })
    );
    spireCone.position.y = 4.55;
    spireCone.castShadow = true;
    chediGroup.add(spireCone);

    scene.add(chediGroup);

    // Traditional Loei festival decorative flags (Tungs) and lanterns around map
    const lanternSpots = [
      [-18, -18], [18, -18], [-18, 18], [18, 18],
      [-23, 0], [23, 0], [0, -23], [0, 23]
    ];
    const lanterns: THREE.Group[] = [];

    lanternSpots.forEach(([lx, lz]) => {
      const lantern = new THREE.Group();
      lantern.position.set(lx, 0, lz);

      // Wooden post
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 2.5, 6),
        new THREE.MeshStandardMaterial({ color: '#27272a' })
      );
      post.position.y = 1.25;
      post.castShadow = true;
      lantern.add(post);

      // Glowing paper lamp
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.6, 6),
        new THREE.MeshBasicMaterial({ color: '#eab308' })
      );
      lamp.position.y = 2.55;
      lantern.add(lamp);

      // Cap
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: '#dc2626' })
      );
      cap.position.y = 2.95;
      lantern.add(cap);

      // Pointlight for ambient aura
      const pl = new THREE.PointLight('#eab308', 0.5, 8);
      pl.position.set(0, 2.55, 0);
      lantern.add(pl);

      scene.add(lantern);
      lanterns.push(lantern);
    });

    // 3. PLAYER CHARACTER: 2D Billboard Facing Camera (player_mask_l8eawp.png)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(6, 0, 6); // start offset from stupa
    scene.add(playerGroup);

    const playerTexture = textureLoader.load(
      'https://res.cloudinary.com/dlcqcokoo/image/upload/v1782439995/player_mask_l8eawp.png',
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(0.25, 0.25); // 4 Columns x 4 Rows
      }
    );

    const playerSkin = skins.find(s => s.id === options.selectedSkinId) || skins[0];
    const playerMat = new THREE.MeshStandardMaterial({
      map: playerTexture,
      transparent: true,
      roughness: 0.5,
      alphaTest: 0.25, // Prevents transparent depth outline artifacts
      side: THREE.DoubleSide
    });

    const playerPlane = new THREE.PlaneGeometry(2.2, 2.2);
    const playerMesh = new THREE.Mesh(playerPlane, playerMat);
    playerMesh.position.y = 1.1; // stand perfectly on ground
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;
    playerGroup.add(playerMesh);

    // Circular dark base shadow
    const blobShadow = new THREE.Mesh(
      new THREE.RingGeometry(0.01, 0.6, 16),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    blobShadow.rotation.x = -Math.PI / 2;
    blobShadow.position.y = 0.02;
    playerGroup.add(blobShadow);

    // 4. COLLECTIBLES: Kratips (Sticky Rice Baskets) & Masks
    const itemTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png',
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
      }
    );

    interface Collectible {
      mesh: THREE.Group;
      type: 'kratip' | 'mask';
      scoreVal: number;
      bobOffset: number;
      currentY: number;
      falling: boolean;
    }
    const collectibles: Collectible[] = [];

    const createKratipMesh = (): THREE.Group => {
      const g = new THREE.Group();
      // Main basket cylinder
      const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.8 })
      );
      basket.position.y = 0.25;
      basket.castShadow = true;
      g.add(basket);

      // Handle cord
      const cord = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.03, 4, 12),
        new THREE.MeshStandardMaterial({ color: '#b45309' })
      );
      cord.rotation.x = Math.PI / 2;
      cord.position.y = 0.5;
      g.add(cord);

      return g;
    };

    const createSacredMaskMesh = (): THREE.Group => {
      const g = new THREE.Group();
      
      const itemMat = new THREE.MeshStandardMaterial({
        map: itemTexture,
        transparent: true,
        alphaTest: 0.15,
        side: THREE.DoubleSide,
        roughness: 0.6
      });
      
      const planeGeo = new THREE.PlaneGeometry(1.6, 1.6);
      const mesh = new THREE.Mesh(planeGeo, itemMat);
      mesh.position.y = 0.8;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "billboard"; // Keep facing the camera
      g.add(mesh);

      // Add a small glowing red point light under it
      const pl = new THREE.PointLight('#dc2626', 1.0, 5);
      pl.position.set(0, 0.6, 0);
      g.add(pl);

      return g;
    };

    // Spawn 8 initial items randomly
    for (let i = 0; i < 8; i++) {
      const isKratip = i % 3 !== 0;
      const mesh = isKratip ? createKratipMesh() : createSacredMaskMesh();
      const type = isKratip ? 'kratip' : 'mask';
      const scoreVal = isKratip ? 100 : 250;

      const collGroup = new THREE.Group();
      collGroup.add(mesh);
      
      // Position inside map boundary
      const rx = (Math.random() - 0.5) * 40;
      const rz = (Math.random() - 0.5) * 40;
      // Keep away from center Chedi
      const finalX = Math.abs(rx) < 5 ? (rx > 0 ? rx + 6 : rx - 6) : rx;
      const finalZ = Math.abs(rz) < 5 ? (rz > 0 ? rz + 6 : rz - 6) : rz;

      // Start high up to fall down!
      collGroup.position.set(finalX, 15, finalZ);
      scene.add(collGroup);

      collectibles.push({
        mesh: collGroup,
        type,
        scoreVal,
        bobOffset: Math.random() * Math.PI * 2,
        currentY: 15,
        falling: true
      });
    }

    // 4.2 ENEMY SPRITE SHEET TEXTURE
    const enemyTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png',
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
      }
    );

    // 4.3 BOSS SPRITE SHEET TEXTURE (2 frames x 2 rows)
    const bossTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/boss_pblkge.png',
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
      }
    );

    // 5. ENEMIES: 2D Animated Sprite Sheet Phi Ta Khon Ghosts
    interface Ghost {
      mesh: THREE.Group;
      spriteMesh: THREE.Mesh;
      texture: THREE.Texture;
      type: 'green' | 'purple' | 'red';
      speed: number;
      health: number;
      bobOffset: number;
      invulnFrames: number;
      redFlashTimer: number;
      whiteFlashTimer: number;
      spriteFrame: number;
      spriteTick: number;
      isDead: boolean;
      deadVelY: number;
      deadVelX: number;
      deadVelZ: number;
      deadRotVel: number;
    }
    const ghosts: Ghost[] = [];

    const createGhost = (type: 'green' | 'purple' | 'red', x: number, z: number): Ghost => {
      const mesh = new THREE.Group();
      mesh.position.set(x, 0.5, z);

      // Clone texture so each ghost tracks its own frames
      const ghostTex = enemyTexture.clone();
      ghostTex.repeat.set(0.25, 0.5); // 4 Columns x 2 Rows
      ghostTex.needsUpdate = true;

      let color = '#4ade80';
      let scale = 1.0;
      let hp = 2; // Every ghost gets 2 hitpoints now! First hit knocks back, second hit knocks out.

      if (type === 'purple') {
        color = '#c084fc';
        scale = 1.15;
      } else if (type === 'red') {
        color = '#f87171'; // Red Boss
        scale = 1.45;
      }

      const ghostMat = new THREE.MeshStandardMaterial({
        map: ghostTex,
        transparent: true,
        roughness: 0.5,
        alphaTest: 0.25,
        color: new THREE.Color(color),
        side: THREE.DoubleSide
      });

      const planeGeo = new THREE.PlaneGeometry(2.2 * scale, 2.2 * scale);
      const spriteMesh = new THREE.Mesh(planeGeo, ghostMat);
      spriteMesh.position.y = 1.1 * scale;
      spriteMesh.castShadow = true;
      spriteMesh.receiveShadow = true;
      mesh.add(spriteMesh);

      // Circular dark base shadow
      const enemyShadow = new THREE.Mesh(
        new THREE.RingGeometry(0.01, 0.55 * scale, 16),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      enemyShadow.rotation.x = -Math.PI / 2;
      enemyShadow.position.y = 0.01;
      mesh.add(enemyShadow);

      scene.add(mesh);

      return {
        mesh,
        spriteMesh,
        texture: ghostTex,
        type,
        speed: (0.018 + Math.random() * 0.02) * playerSkin.speedMultiplier,
        health: hp,
        bobOffset: Math.random() * Math.PI * 2,
        invulnFrames: 0,
        redFlashTimer: 0,
        whiteFlashTimer: 0,
        spriteFrame: 0,
        spriteTick: 0,
        isDead: false,
        deadVelY: 0,
        deadVelX: 0,
        deadVelZ: 0,
        deadRotVel: 0
      };
    };

    // Spawn initial ghosts
    for (let i = 0; i < 4; i++) {
      const type = i === 0 ? 'red' : (i === 1 ? 'purple' : 'green');
      const angle = (i / 4) * Math.PI * 2;
      const gx = Math.cos(angle) * 18;
      const gz = Math.sin(angle) * 18;
      ghosts.push(createGhost(type, gx, gz));
    }

    // 6. DETAILED GAME PARTICLES
    interface Particle {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
      type: 'strike' | 'aura' | 'purify' | 'star';
    }
    const particles: Particle[] = [];

    const spawnSparks = (x: number, y: number, z: number, colorStr: string, count = 10, type: 'strike' | 'aura' | 'purify' = 'strike') => {
      const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({ color: colorStr, transparent: true });

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat.clone());
        mesh.position.set(x, y + (Math.random() - 0.5) * 0.5, z);
        scene.add(mesh);

        let vel = new THREE.Vector3();
        if (type === 'aura') {
          // Ring expand velocity
          const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          vel.set(Math.cos(ang) * 0.12, 0.02, Math.sin(ang) * 0.12);
        } else if (type === 'purify') {
          // Floats straight up beautifully
          vel.set((Math.random() - 0.5) * 0.04, 0.08 + Math.random() * 0.04, (Math.random() - 0.5) * 0.04);
        } else {
          // Chaos scatter for physical hits
          vel.set(
            (Math.random() - 0.5) * 0.15,
            0.05 + Math.random() * 0.1,
            (Math.random() - 0.5) * 0.15
          );
        }

        particles.push({
          mesh,
          vel,
          life: 1.0,
          maxLife: type === 'purify' ? 60 : (type === 'aura' ? 45 : 25),
          type
        });
      }
    };

    // Game states
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let playerPos = playerGroup.position;
    let isAttacking = false;
    let attackTimer = 0;
    let isDancing = false;
    let danceTimer = 0;
    let playerInvuln = 0;
    let playerFacingLeft = false;

    // Sprite frame ticking
    let spriteFrame = 0;
    let spriteTick = 0;

    // Boss & Event Tracking Variables
    let defeatedCount = 0;
    let bossActive = false;
    let bossSpawnedOnce = false;
    let bossEntity: {
      mesh: THREE.Group;
      spriteMesh: THREE.Mesh;
      texture: THREE.Texture;
      health: number;
      maxHealth: number;
      state: 'idle' | 'dashing' | 'warning' | 'attacking';
      stateTimer: number;
      targetPos: THREE.Vector3;
      invulnFrames: number;
      flashTimer: number;
      bobOffset: number;
      scaleFactor: number;
      spriteFrame: number;
      spriteTick: number;
    } | null = null;

    interface Fireball {
      mesh: THREE.Mesh;
      indicatorMesh: THREE.Mesh;
      sourcePos: THREE.Vector3;
      targetPos: THREE.Vector3;
      progress: number;
      speed: number;
    }
    const fireballs: Fireball[] = [];

    let warpGateEntity: {
      mesh: THREE.Group;
      active: boolean;
    } | null = null;

    // Helper to spawn the Giant Ghost Boss
    const spawnBoss = () => {
      if (bossSpawnedOnce) return;
      bossSpawnedOnce = true;

      const bGroup = new THREE.Group();
      bGroup.position.set(0, 1.4, -6); // Central upper spot

      const bTex = bossTexture.clone();
      bTex.repeat.set(0.5, 0.5); // 2 columns x 2 rows
      bTex.needsUpdate = true;

      const bMat = new THREE.MeshStandardMaterial({
        map: bTex,
        transparent: true,
        roughness: 0.4,
        alphaTest: 0.15,
        side: THREE.DoubleSide
      });

      const bGeo = new THREE.PlaneGeometry(4.4, 4.4);
      const bSprite = new THREE.Mesh(bGeo, bMat);
      bSprite.position.y = 2.1;
      bSprite.castShadow = true;
      bSprite.receiveShadow = true;
      bGroup.add(bSprite);

      // Large boss shadow
      const bShadow = new THREE.Mesh(
        new THREE.RingGeometry(0.01, 1.3, 32),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      bShadow.rotation.x = -Math.PI / 2;
      bShadow.position.y = 0.02;
      bGroup.add(bShadow);

      scene.add(bGroup);

      bossEntity = {
        mesh: bGroup,
        spriteMesh: bSprite,
        texture: bTex,
        health: 12,
        maxHealth: 12,
        state: 'idle',
        stateTimer: 90,
        targetPos: new THREE.Vector3(0, 1.4, -6),
        invulnFrames: 0,
        flashTimer: 0,
        bobOffset: 0,
        scaleFactor: 1.0,
        spriteFrame: 0,
        spriteTick: 0
      };

      bossActive = true;
      setBossSpawned(true);
      setBossHp(12);

      // Sparklers decoration!
      spawnSparks(0, 2.0, -6, '#ef4444', 30, 'purify');
      synth.playCollect(!soundMutedRef.current);
    };

    // Helper to spawn a Fireball with a ground dodge indicator
    const spawnFireball = (fromPos: THREE.Vector3, toPos: THREE.Vector3) => {
      const ballGeo = new THREE.SphereGeometry(0.42, 16, 16);
      const ballMat = new THREE.MeshBasicMaterial({ color: '#f97316' });
      const ballMesh = new THREE.Mesh(ballGeo, ballMat);
      ballMesh.position.copy(fromPos);
      scene.add(ballMesh);

      // Ground circular warning indicator
      const indicatorGeo = new THREE.RingGeometry(0.01, 1.3, 32);
      const indicatorMat = new THREE.MeshBasicMaterial({
        color: '#dc2626',
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const indicatorMesh = new THREE.Mesh(indicatorGeo, indicatorMat);
      indicatorMesh.rotation.x = -Math.PI / 2;
      indicatorMesh.position.set(toPos.x, 0.03, toPos.z);
      scene.add(indicatorMesh);

      fireballs.push({
        mesh: ballMesh,
        indicatorMesh,
        sourcePos: fromPos.clone(),
        targetPos: toPos.clone(),
        progress: 0,
        speed: 0.015 + Math.random() * 0.006 // nice comfortable speed to dodge
      });
    };

    // Helper to spawn Warp Gate after Boss defeat
    const spawnWarpGate = (x: number, z: number) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(x, 0.02, z);

      // Spinning torus ring
      const ringGeo = new THREE.TorusGeometry(1.4, 0.14, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: '#a855f7',
        emissive: '#c084fc',
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.9
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.y = 0;
      ringMesh.position.y = 1.4;
      gateGroup.add(ringMesh);

      // Translucent inner vortex cylinder/disc
      const coreGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: '#2563eb',
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI / 2;
      coreMesh.position.y = 1.4;
      gateGroup.add(coreMesh);

      scene.add(gateGroup);
      warpGateEntity = {
        mesh: gateGroup,
        active: true
      };

      spawnSparks(x, 1.4, z, '#c084fc', 25, 'purify');
    };

    // Camera feedback states
    let cameraShake = 0;

    scoreRef.current = 0;
    livesRef.current = 5;
    setScore(0);
    setLives(5);
    setMultiplier(1);

    // Spawner timers
    let ghostSpawnTimer = 0;

    // Trigger hit sound and visual damage flashing
    const handlePlayerHit = (ghostX: number, ghostZ: number) => {
      if (playerInvuln > 0) return;

      synth.playHit(!soundMutedRef.current);
      livesRef.current -= 1;
      setLives(livesRef.current);
      playerInvuln = 90; // 1.5 seconds at 60 FPS
      cameraShake = 15; // Camera shake ticks

      // Knockback player away from ghost
      const kDir = new THREE.Vector3(playerPos.x - ghostX, 0, playerPos.z - ghostZ).normalize();
      playerPos.x += kDir.x * 2.5;
      playerPos.z += kDir.z * 2.5;

      if (livesRef.current <= 0) {
        synth.playGameOver(!soundMutedRef.current);
        onGameOver(scoreRef.current);
      }
    };

    // PUNCH attack action
    const triggerPunch = () => {
      if (isAttacking || isDancing) return;
      isAttacking = true;
      attackTimer = 24; // 24 ticks (400ms duration)
      spriteFrame = 0;

      synth.playJump(!soundMutedRef.current); // trigger quick air swish synth sound

      // Spawn bright flame-red fist swish sparks ahead of player
      const dirMult = playerFacingLeft ? -1.2 : 1.2;
      spawnSparks(playerPos.x + dirMult, playerPos.y + 1.0, playerPos.z, '#dc2626', 8, 'strike');

      // Check collision range for ghosts
      ghosts.forEach((g) => {
        if (g.isDead) return; // Skip already dead / flying out ghosts

        const dx = g.mesh.position.x - playerPos.x;
        const dz = g.mesh.position.z - playerPos.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < 2.5) {
          // Check horizontal direction matching punch facing
          const sideMatch = playerFacingLeft ? (dx < 0.2) : (dx > -0.2);
          if (sideMatch && g.invulnFrames === 0) {
            g.health -= 1;
            g.invulnFrames = 20;

            // Flash physical strike particles
            spawnSparks(g.mesh.position.x, g.mesh.position.y + 0.8, g.mesh.position.z, '#fbbf24', 12, 'strike');
            synth.playHit(!soundMutedRef.current);

            // Knockback vector
            const push = new THREE.Vector3(g.mesh.position.x - playerPos.x, 0, g.mesh.position.z - playerPos.z).normalize();

            if (g.health === 1) {
              // 1st Hit: Knock back in direction opposite to approach (away from player)
              g.mesh.position.x += push.x * 3.8;
              g.mesh.position.z += push.z * 3.8;
              g.whiteFlashTimer = 18; // Flash white briefly
            } else if (g.health <= 0) {
              // 2nd Hit: Knockout! Fly high into the air and spin out of bounds while flashing white rapidly
              g.isDead = true;
              g.deadVelY = 0.42;
              g.deadVelX = push.x * 0.26;
              g.deadVelZ = push.z * 0.26;
              g.deadRotVel = 0.16;

              scoreRef.current += 150;
              setScore(scoreRef.current);

              defeatedCount++;
              setEnemiesDefeated(defeatedCount);

              if (defeatedCount >= 10 && !bossSpawnedOnce) {
                spawnBoss();
              }

              spawnSparks(g.mesh.position.x, g.mesh.position.y + 0.8, g.mesh.position.z, '#ffffff', 22, 'purify');
            }
          }
        }
      });
    };

    // DANCE sacred aura purification skill action
    const triggerDance = () => {
      if (isAttacking || isDancing) return;
      isDancing = true;
      danceTimer = 75; // 1.25 seconds duration
      spriteFrame = 0;

      setShowSkillAuraMessage(true);
      setTimeout(() => setShowSkillAuraMessage(false), 1500);

      // Play escalating beautiful chime synthesizer sweep
      synth.playCollect(!soundMutedRef.current);

      // Aura shockwave particle rings
      spawnSparks(playerPos.x, playerPos.y + 0.2, playerPos.z, '#ef4444', 24, 'aura');
      spawnSparks(playerPos.x, playerPos.y + 0.2, playerPos.z, '#f59e0b', 24, 'aura');
    };

    // Continuous click trigger bindings for touch joystick buttons
    let lastPunchInput = false;
    let lastDanceInput = false;

    // ANIMATION LOOP
    const tick = () => {
      if (isPausedRef.current) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      // 1. Process Input Movement
      let dx = 0;
      let dz = 0;

      if (inputsRef.current.left) dx = -1;
      if (inputsRef.current.right) dx = 1;
      if (inputsRef.current.up) dz = -1;
      if (inputsRef.current.down) dz = 1;

      // Detect virtual buttons trigger changes (edge detection)
      if (inputsRef.current.punch && !lastPunchInput) {
        triggerPunch();
      }
      if (inputsRef.current.dance && !lastDanceInput) {
        triggerDance();
      }
      lastPunchInput = inputsRef.current.punch;
      lastDanceInput = inputsRef.current.dance;

      // Handle continuous timers
      if (isAttacking) {
        attackTimer--;
        if (attackTimer <= 0) isAttacking = false;
      }

      if (isDancing) {
        danceTimer--;
        if (danceTimer % 10 === 0) {
          // Expand aura pulses
          spawnSparks(playerPos.x, playerPos.y + 0.2, playerPos.z, '#eab308', 12, 'aura');
          
          // Purify any ghost in large circular radius
          ghosts.forEach((g) => {
            if (g.isDead) return;
            const dist = g.mesh.position.distanceTo(playerPos);
            if (dist < 4.8) {
              // Purified! Float upwards gracefully
              spawnSparks(g.mesh.position.x, g.mesh.position.y + 0.5, g.mesh.position.z, '#fbbf24', 18, 'purify');
              synth.playCollect(!soundMutedRef.current);

              scoreRef.current += 200 * multiplierRef.current;
              setScore(scoreRef.current);

              // Trigger 2nd-hit launch knockout fly-out!
              g.isDead = true;
              g.deadVelY = 0.42;
              const push = new THREE.Vector3(g.mesh.position.x - playerPos.x, 0, g.mesh.position.z - playerPos.z).normalize();
              g.deadVelX = push.x * 0.28;
              g.deadVelZ = push.z * 0.28;
              g.deadRotVel = 0.16;

              defeatedCount++;
              setEnemiesDefeated(defeatedCount);

              if (defeatedCount >= 10 && !bossSpawnedOnce) {
                spawnBoss();
              }
            }
          });
        }
        if (danceTimer <= 0) isDancing = false;
      }

      // Update movement position if not locked
      const isMoving = dx !== 0 || dz !== 0;
      if (isMoving) {
        // Slow speed slightly during actions
        const speedFactor = (isAttacking || isDancing) ? 0.4 : 1.0;
        const currentSpeed = 0.09 * playerSkin.speedMultiplier * speedFactor;

        // Diagonal normalization
        const len = Math.sqrt(dx * dx + dz * dz);
        playerPos.x += (dx / len) * currentSpeed;
        playerPos.z += (dz / len) * currentSpeed;

        // Set facing direction
        if (dx < 0) playerFacingLeft = true;
        if (dx > 0) playerFacingLeft = false;
      }

      // Keep inside 50x50 map bounds
      playerPos.x = Math.max(-23.8, Math.min(23.8, playerPos.x));
      playerPos.z = Math.max(-23.8, Math.min(23.8, playerPos.z));

      // Player billboard mesh must match camera angle
      playerMesh.quaternion.copy(camera.quaternion);

      // Mirror texture horizontally depending on player horizontal orientation
      playerMesh.scale.x = playerFacingLeft ? -1.0 : 1.0;

      // 2. SPRITE SHEET FRAMING (Row offsets requested)
      // Row offsets (V direction, starting from bottom-left=0)
      // Row 4: Dance (bottom-most) => y=0.0
      // Row 3: Attack => y=0.25
      // Row 2: Walk => y=0.5
      // Row 1: Idle (top-most) => y=0.75
      let activeRowY = 0.75; // Default Idle
      let tickThreshold = 10; // Animation frame speed

      if (isDancing) {
        activeRowY = 0.0;
        tickThreshold = 6;
      } else if (isAttacking) {
        activeRowY = 0.25;
        tickThreshold = 4;
      } else if (isMoving) {
        activeRowY = 0.5;
        tickThreshold = 8;
      } else {
        activeRowY = 0.75;
        tickThreshold = 12;
      }

      spriteTick++;
      if (spriteTick >= tickThreshold) {
        spriteTick = 0;
        spriteFrame = (spriteFrame + 1) % 4;
      }

      playerTexture.offset.x = spriteFrame * 0.25;
      playerTexture.offset.y = activeRowY;

      // Handle player damage blinking
      if (playerInvuln > 0) {
        playerInvuln--;
        playerMesh.visible = Math.floor(playerInvuln / 4) % 2 === 0;
      } else {
        playerMesh.visible = true;
      }

      // 1.3 UPDATE INTERACTABLE GRASS PATCHES
      grassPatches.forEach((gp) => {
        // Keep billboard facing camera
        gp.mesh.quaternion.copy(camera.quaternion);

        // Check distance to player
        const dist = gp.mesh.position.distanceTo(playerPos);
        if (dist < 1.0) {
          gp.targetScaleY = 0.15; // Flatten when stepped on
        } else {
          gp.targetScaleY = 1.0; // Restore to normal height
        }

        // Smoothly interpolate height scale
        gp.currentScaleY += (gp.targetScaleY - gp.currentScaleY) * 0.18;
        gp.mesh.scale.set(1.0, gp.currentScaleY, 1.0);

        // Anchor bottom of plane to ground
        gp.mesh.position.y = gp.currentScaleY * 0.6;
      });

      // 3. UPDATE CHASING GHOSTS
      ghosts.forEach((g) => {
        const mat = g.spriteMesh.material as THREE.MeshStandardMaterial;

        // A. Handle knockout / dead flying out of bounds animation
        if (g.isDead) {
          g.mesh.position.y += g.deadVelY;
          g.mesh.position.x += g.deadVelX;
          g.mesh.position.z += g.deadVelZ;
          g.spriteMesh.rotation.z += g.deadRotVel;
          g.deadVelY -= 0.012; // Gravity simulation

          // Rapid white flash on knockout
          const flash = Math.floor(clock.getElapsedTime() * 40) % 2 === 0;
          mat.emissive.set(flash ? '#ffffff' : '#000000');
          mat.emissiveIntensity = flash ? 2.5 : 0.0;

          // Face camera billboard
          g.spriteMesh.quaternion.copy(camera.quaternion);

          // Once it falls below or goes too high, reset and relocate
          if (g.mesh.position.y < -3.0 || g.mesh.position.y > 22) {
            const angle = Math.random() * Math.PI * 2;
            g.mesh.position.set(playerPos.x + Math.cos(angle) * 19, 0.5, playerPos.z + Math.sin(angle) * 19);
            g.spriteMesh.rotation.z = 0;
            g.isDead = false;
            g.health = 2;
            g.invulnFrames = 0;
            mat.emissive.set('#000000');
            mat.emissiveIntensity = 0.0;
            mat.color.set(g.type === 'red' ? '#f87171' : (g.type === 'purple' ? '#c084fc' : '#4ade80'));
          }
          return; // Skip standard chasing logic
        }

        if (g.invulnFrames > 0) g.invulnFrames--;

        // B. Flash controls (Red flash during attack, white flash during hit)
        if (g.redFlashTimer > 0) {
          g.redFlashTimer--;
          const flash = Math.floor(g.redFlashTimer / 4) % 2 === 0;
          mat.color.set(flash ? '#ef4444' : (g.type === 'red' ? '#f87171' : (g.type === 'purple' ? '#c084fc' : '#4ade80')));
          mat.emissive.set(flash ? '#ef4444' : '#000000');
          mat.emissiveIntensity = flash ? 1.5 : 0.0;
        } else if (g.whiteFlashTimer > 0) {
          g.whiteFlashTimer--;
          const flash = Math.floor(g.whiteFlashTimer / 3) % 2 === 0;
          mat.emissive.set(flash ? '#ffffff' : '#000000');
          mat.emissiveIntensity = flash ? 2.0 : 0.0;
        } else {
          mat.color.set(g.type === 'red' ? '#f87171' : (g.type === 'purple' ? '#c084fc' : '#4ade80'));
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }

        // C. Sprite animation framing and movement
        const toPlayer = new THREE.Vector3().copy(playerPos).sub(g.mesh.position);
        toPlayer.y = 0;
        const dist = toPlayer.length();

        const isMoving = dist > 0.1;
        if (isMoving) {
          toPlayer.normalize();
          g.mesh.position.addScaledVector(toPlayer, g.speed);
        }

        // Bob ghost height gently to simulate floating spirit
        g.mesh.position.y = 0.55 + Math.sin(clock.getElapsedTime() * 4.0 + g.bobOffset) * 0.12;

        // Keep billboard facing camera
        g.spriteMesh.quaternion.copy(camera.quaternion);

        // Flip left/right based on movement direction
        if (toPlayer.x < -0.05) {
          g.spriteMesh.scale.x = 1.0; // Left (faces left default)
        } else if (toPlayer.x > 0.05) {
          g.spriteMesh.scale.x = -1.0; // Right (mirror right)
        }

        // Handle animation frame ticking (Row 1 standing/idle, Row 2 walking/running)
        let activeRowY = 0.5; // Default Stand
        let tickThreshold = 12;

        if (isMoving) {
          activeRowY = 0.0; // Walk Row
          tickThreshold = 8;
        }

        g.spriteTick++;
        if (g.spriteTick >= tickThreshold) {
          g.spriteTick = 0;
          g.spriteFrame = (g.spriteFrame + 1) % 4;
        }

        g.texture.offset.x = g.spriteFrame * 0.25;
        g.texture.offset.y = activeRowY;

        // D. Collision damage check
        if (dist < 1.15 && playerInvuln === 0) {
          g.redFlashTimer = 30; // Flash red on attack striking player
          handlePlayerHit(g.mesh.position.x, g.mesh.position.z);
        }
      });

      // Periodically spawn new ghosts to maintain tension (every 1-3 seconds)
      ghostSpawnTimer++;
      const randomThreshold = 60 + Math.random() * 120; // 60 to 180 ticks (1-3s)
      if (ghostSpawnTimer > randomThreshold) {
        ghostSpawnTimer = 0;
        // Limit standard ghosts to 8, and stop spawning once the boss has spawned to let player focus on boss!
        if (ghosts.length < 8 && !bossSpawnedOnce) {
          // Spawn from all directions around the player
          const angle = Math.random() * Math.PI * 2;
          const sx = playerPos.x + Math.cos(angle) * 19;
          const sz = playerPos.z + Math.sin(angle) * 19;
          const types: ('green'|'purple'|'red')[] = ['green', 'purple', 'green'];
          const rType = types[Math.floor(Math.random() * types.length)];
          ghosts.push(createGhost(rType, sx, sz));
        }
      }

      // UPDATE BOSS ENTITY ("นิ่ง พุ่งไกล-ใกล้ ก่อนโยนลูกไฟจะขยายย่อ เป็น step บอก")
      if (bossActive && bossEntity) {
        const b = bossEntity;
        const bMat = b.spriteMesh.material as THREE.MeshStandardMaterial;

        // A. Handle knockout damage/flash effects
        if (b.invulnFrames > 0) b.invulnFrames--;
        if (b.flashTimer > 0) {
          b.flashTimer--;
          const flash = Math.floor(b.flashTimer / 3) % 2 === 0;
          bMat.emissive.set(flash ? '#ffffff' : '#000000');
          bMat.emissiveIntensity = flash ? 2.2 : 0.0;
        } else {
          bMat.emissive.set('#000000');
          bMat.emissiveIntensity = 0.0;
        }

        // B. Billboarding towards camera
        b.spriteMesh.quaternion.copy(camera.quaternion);

        // Face left or right based on relative player direction
        if (playerPos.x < b.mesh.position.x - 0.2) {
          b.spriteMesh.scale.x = 1.0; // left
        } else if (playerPos.x > b.mesh.position.x + 0.2) {
          b.spriteMesh.scale.x = -1.0; // right
        }

        // C. Pattern sequence updates
        b.stateTimer--;

        if (b.state === 'idle') {
          // Hover gently
          b.mesh.position.y = 1.4 + Math.sin(clock.getElapsedTime() * 3.5) * 0.16;
          b.scaleFactor = 1.0;

          if (b.stateTimer <= 0) {
            // Decides next movement: dash close or far from player
            b.state = 'dashing';
            b.stateTimer = 55;
            const angle = Math.random() * Math.PI * 2;
            const dist = 3.5 + Math.random() * 9.0; // near or far
            b.targetPos.set(
              Math.max(-21, Math.min(21, playerPos.x + Math.cos(angle) * dist)),
              1.4,
              Math.max(-21, Math.min(21, playerPos.z + Math.sin(angle) * dist))
            );
          }
        } else if (b.state === 'dashing') {
          // Dash smoothly to targeted location
          b.mesh.position.lerp(b.targetPos, 0.08);
          b.mesh.position.y = 1.4 + Math.sin(clock.getElapsedTime() * 4.5) * 0.1;
          b.scaleFactor = 1.0;

          if (b.stateTimer <= 0 || b.mesh.position.distanceTo(b.targetPos) < 1.0) {
            // Warn before casting fireballs
            b.state = 'warning';
            b.stateTimer = 65; // Warn step duration
          }
        } else if (b.state === 'warning') {
          // ขยายย่อ เป็น step บอก
          const wave = Math.sin(clock.getElapsedTime() * 16.0);
          b.scaleFactor = 1.0 + Math.abs(wave) * 0.38; // scale pulsations

          b.mesh.position.y = 1.4 + Math.sin(clock.getElapsedTime() * 2.0) * 0.04;

          if (b.stateTimer <= 0) {
            b.state = 'attacking';
            b.stateTimer = 35; // firing frame delay

            // Shoot 3 circular fireballs falling from sky
            spawnFireball(b.mesh.position, playerPos);

            const offset1 = new THREE.Vector3(
              playerPos.x + (Math.random() - 0.5) * 6,
              playerPos.y,
              playerPos.z + (Math.random() - 0.5) * 6
            );
            spawnFireball(b.mesh.position, offset1);

            const offset2 = new THREE.Vector3(
              playerPos.x + (Math.random() - 0.5) * 8,
              playerPos.y,
              playerPos.z + (Math.random() - 0.5) * 8
            );
            spawnFireball(b.mesh.position, offset2);

            synth.playJump(!soundMutedRef.current);
          }
        } else if (b.state === 'attacking') {
          b.scaleFactor = 1.0;
          if (b.stateTimer <= 0) {
            b.state = 'idle';
            b.stateTimer = 85;
          }
        }

        // Apply scale factors to spriteMesh
        b.spriteMesh.scale.set(b.scaleFactor * (b.spriteMesh.scale.x < 0 ? -1.0 : 1.0), b.scaleFactor, 1.0);

        // D. Boss texture offset cycles (2 cols x 2 rows)
        b.spriteTick++;
        if (b.spriteTick >= 10) {
          b.spriteTick = 0;
          b.spriteFrame = (b.spriteFrame + 1) % 2;
        }
        const isAttackingOrWarning = b.state === 'warning' || b.state === 'attacking';
        const activeRowY = isAttackingOrWarning ? 0.0 : 0.5;

        b.texture.offset.x = b.spriteFrame * 0.5;
        b.texture.offset.y = activeRowY;

        // E. Punch hits on Boss check
        if (isAttacking && attackTimer === 23 && b.invulnFrames === 0) {
          const dx = b.mesh.position.x - playerPos.x;
          const dz = b.mesh.position.z - playerPos.z;
          const dist = Math.sqrt(dx*dx + dz*dz);

          if (dist < 3.2) {
            const sideMatch = playerFacingLeft ? (dx < 0.2) : (dx > -0.2);
            if (sideMatch) {
              b.health -= 1;
              b.invulnFrames = 30;
              b.flashTimer = 25;
              setBossHp(b.health);

              spawnSparks(b.mesh.position.x, b.mesh.position.y + 1.5, b.mesh.position.z, '#ef4444', 18, 'strike');
              synth.playHit(!soundMutedRef.current);

              if (b.health <= 0) {
                // Defeated!
                bossActive = false;
                setBossHp(null);
                spawnSparks(b.mesh.position.x, b.mesh.position.y + 1.5, b.mesh.position.z, '#ffffff', 40, 'purify');
                spawnWarpGate(b.mesh.position.x, b.mesh.position.z);
                scene.remove(b.mesh);
                b.texture.dispose();
              }
            }
          }
        }

        // F. Dance Aura purify hits on Boss check
        if (isDancing && danceTimer % 10 === 0 && b.invulnFrames === 0) {
          const dist = b.mesh.position.distanceTo(playerPos);
          if (dist < 5.2) {
            b.health -= 1;
            b.invulnFrames = 30;
            b.flashTimer = 25;
            setBossHp(b.health);

            spawnSparks(b.mesh.position.x, b.mesh.position.y + 1.5, b.mesh.position.z, '#fbbf24', 18, 'purify');
            synth.playCollect(!soundMutedRef.current);

            if (b.health <= 0) {
              bossActive = false;
              setBossHp(null);
              spawnSparks(b.mesh.position.x, b.mesh.position.y + 1.5, b.mesh.position.z, '#ffffff', 40, 'purify');
              spawnWarpGate(b.mesh.position.x, b.mesh.position.z);
              scene.remove(b.mesh);
              b.texture.dispose();
            }
          }
        }

        // G. Simple body contact damage check (if not invuln)
        const dPlayer = b.mesh.position.distanceTo(playerPos);
        if (dPlayer < 1.8 && playerInvuln === 0) {
          handlePlayerHit(b.mesh.position.x, b.mesh.position.z);
        }
      }

      // UPDATE FLYING FIREBALLS
      for (let i = fireballs.length - 1; i >= 0; i--) {
        const fb = fireballs[i];
        fb.progress += fb.speed;

        if (fb.progress >= 1.0) {
          // Impact!
          spawnSparks(fb.targetPos.x, 0.1, fb.targetPos.z, '#f97316', 15, 'strike');
          synth.playHit(!soundMutedRef.current);

          // Damage check
          const distToPlayer = playerPos.distanceTo(fb.targetPos);
          if (distToPlayer < 1.8 && playerInvuln === 0) {
            handlePlayerHit(fb.targetPos.x, fb.targetPos.z);
          }

          // Clean up meshes
          scene.remove(fb.mesh);
          fb.mesh.geometry.dispose();
          if (Array.isArray(fb.mesh.material)) {
            fb.mesh.material.forEach((m) => m.dispose());
          } else {
            fb.mesh.material.dispose();
          }

          scene.remove(fb.indicatorMesh);
          fb.indicatorMesh.geometry.dispose();
          if (Array.isArray(fb.indicatorMesh.material)) {
            fb.indicatorMesh.material.forEach((m) => m.dispose());
          } else {
            fb.indicatorMesh.material.dispose();
          }

          fireballs.splice(i, 1);
        } else {
          // Parabolic flight trajectory
          const currentX = THREE.MathUtils.lerp(fb.sourcePos.x, fb.targetPos.x, fb.progress);
          const currentZ = THREE.MathUtils.lerp(fb.sourcePos.z, fb.targetPos.z, fb.progress);
          
          const heightPeak = 7.0;
          const currentY = fb.sourcePos.y + Math.sin(fb.progress * Math.PI) * heightPeak;

          fb.mesh.position.set(currentX, currentY, currentZ);
          fb.mesh.rotation.x += 0.05;
          fb.mesh.rotation.y += 0.05;

          // Pulse visual target indicator
          fb.indicatorMesh.scale.setScalar(0.4 + fb.progress * 0.6);
        }
      }

      // UPDATE WARP GATE
      if (warpGateEntity && warpGateEntity.active) {
        const wg = warpGateEntity;
        wg.mesh.rotation.y += 0.012;

        const dist = wg.mesh.position.distanceTo(playerPos);
        if (dist < 1.4) {
          wg.active = false;
          synth.playCollect(!soundMutedRef.current);
          
          // Warp player to the Ending!
          setTimeout(() => {
            onEnding(scoreRef.current);
          }, 400);
        }
      }

      // 4. UPDATE ROTATING COLLECTIBLES
      collectibles.forEach((c) => {
        // Spin and float bob or fall
        if (c.falling) {
          c.currentY -= 0.25; // fall speed
          if (c.currentY <= 0.5) {
            c.currentY = 0.5;
            c.falling = false;
            // Spawn impact ground sparks
            spawnSparks(c.mesh.position.x, 0.1, c.mesh.position.z, c.type === 'mask' ? '#ef4444' : '#eab308', 6, 'strike');
          }
          c.mesh.position.y = c.currentY;
        } else {
          c.mesh.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 2.5 + c.bobOffset) * 0.12;
        }

        // Keep billboard facing camera
        const bb = c.mesh.getObjectByName("billboard");
        if (bb) {
          bb.quaternion.copy(camera.quaternion);
        } else {
          c.mesh.rotation.y += 0.025;
        }

        // Collision check
        const dist = c.mesh.position.distanceTo(playerPos);
        if (dist < 1.4) {
          // Play pick-up chime
          synth.playCollect(!soundMutedRef.current);

          // Add Score
          scoreRef.current += c.scoreVal * multiplierRef.current;
          setScore(scoreRef.current);

          // เติมพลัง (Heal) - if collected red mask item
          if (c.type === 'mask') {
            if (livesRef.current < 5) {
              livesRef.current += 1;
              setLives(livesRef.current);
            }
          }

          // Particle burst
          const colorHex = c.type === 'mask' ? '#ef4444' : '#fbbf24';
          spawnSparks(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, colorHex, 10, 'strike');

          // Relocate elsewhere and fall from high Y!
          const rx = (Math.random() - 0.5) * 42;
          const rz = (Math.random() - 0.5) * 42;
          c.mesh.position.set(
            Math.abs(rx) < 5 ? (rx > 0 ? rx + 6 : rx - 6) : rx,
            15, // Falling height
            Math.abs(rz) < 5 ? (rz > 0 ? rz + 6 : rz - 6) : rz
          );
          c.currentY = 15;
          c.falling = true;
        }
      });

      // 5. UPDATE PARTICLES LIFE
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.vel);
        p.life -= 1.0 / p.maxLife;

        // Scale down and fade out
        p.mesh.scale.setScalar(p.life);
        
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          if (Array.isArray(p.mesh.material)) {
            p.mesh.material.forEach((m) => m.dispose());
          } else {
            p.mesh.material.dispose();
          }
          particles.splice(i, 1);
        }
      }

      // 6. CAMERA tracking with smooth damp (lerp) & shake
      const idealCameraPos = new THREE.Vector3(playerPos.x, playerPos.y + 9.5, playerPos.z + 11.5);
      camera.position.lerp(idealCameraPos, 0.08);

      if (cameraShake > 0) {
        cameraShake--;
        const shakeMult = cameraShake * 0.04;
        camera.position.x += (Math.random() - 0.5) * shakeMult;
        camera.position.y += (Math.random() - 0.5) * shakeMult;
        camera.position.z += (Math.random() - 0.5) * shakeMult;
      }

      // Camera looks down directly at player
      camera.lookAt(playerPos.x, playerPos.y + 0.6, playerPos.z);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // Dynamic resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // CLEANUP Three.js on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      // Dispose scene objects
      scene.clear();
      renderer.dispose();
    };
  }, [options.selectedSkinId, skins]);

  // Toggle local mute state
  const toggleSound = () => {
    setSoundMuted(!soundMuted);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-5xl mx-auto bg-black text-white font-kanit">
      
      {/* HUD Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/90 border-b border-zinc-900 z-10 select-none">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 rounded-sm border border-zinc-850 cursor-pointer"
          id="btn-back-menu"
        >
          <ArrowLeft size={13} />
          <span>ออกจากเกม (MENU)</span>
        </button>

        {/* Dynamic Display Indicators */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Real-time score ticker */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">SCORE</span>
            <span className="text-xl font-bold font-mono tracking-wider text-white mt-1">
              {score}
            </span>
          </div>

          {/* Enemies Defeated Tracker */}
          <div className="flex flex-col items-center border-l border-zinc-900 pl-4 sm:pl-6">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">DEFEATED</span>
            <span className="text-xl font-bold font-mono tracking-wider text-amber-500 mt-1">
              {enemiesDefeated} <span className="text-zinc-600 text-xs font-normal">/ 10</span>
            </span>
          </div>

          {/* Heart Lives Mask tracker */}
          <div className="flex flex-col items-center border-l border-zinc-900 pl-4 sm:pl-6">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">HEALTH</span>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-5 transition-all duration-300 ${
                    idx < lives 
                      ? 'bg-red-600 scale-100 opacity-100 shadow-[0_0_8px_rgba(220,38,38,0.5)]' 
                      : 'bg-zinc-800 scale-90 opacity-40'
                  }`}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}
                  title="Life Mask"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Audio Toggler */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 rounded-sm border border-zinc-850 cursor-pointer"
            title={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            id="btn-toggle-sound"
          >
            {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area Container */}
      <div 
        ref={containerRef} 
        className="relative w-full aspect-[16/9] max-h-[500px] bg-black flex items-center justify-center overflow-hidden select-none border border-zinc-900 shadow-2xl"
      >
        {/* Giant Ghost Boss HP Overlay Bar */}
        {bossSpawned && bossHp !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xs sm:max-w-md bg-black/90 border border-red-700 p-2.5 z-20 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.35)] font-kanit rounded-none">
            <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">
              <span className="animate-pulse">👹 ผีตาโขนยักษ์ (GIANT GHOST BOSS)</span>
              <span className="font-mono">{bossHp} / {bossMaxHp} HP</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 border border-red-950 rounded-none overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-700 via-orange-600 to-red-600 transition-all duration-300"
                style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="w-full block h-full"
        />

        {/* floating active action skill visual announcement */}
        {showSkillAuraMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-black font-black text-xs px-4 py-2 border border-yellow-400 uppercase tracking-[0.2em] shadow-lg animate-bounce rounded-none">
            🌟 SACRED PURIFICATION CIRCLE ACTIVATED! 🌟
          </div>
        )}

        {/* Pause Screen Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-30 backdrop-blur-md transition-all">
            <div className="max-w-md w-full bg-zinc-950 border-2 border-red-800 p-8 rounded-none shadow-2xl flex flex-col items-center text-center">
              {/* Sacred graphic header */}
              <div className="w-12 h-12 bg-red-950 border border-red-800 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] font-mono font-black text-lg">
                II
              </div>
              
              <h2 className="text-xl font-black tracking-[0.1em] text-red-500 uppercase">
                เกมหยุดชั่วคราว
              </h2>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest leading-relaxed">
                GAME PAUSED • DAN SAI ADVENTURE
              </p>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-red-800 to-transparent my-5" />

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setIsPaused(false);
                    synth.startMusic(!soundMuted);
                  }}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold uppercase tracking-wider text-xs border border-red-500 transition-all cursor-pointer"
                >
                  เล่นต่อ (RESUME GAME)
                </button>

                <button
                  onClick={() => {
                    synth.stopMusic();
                    onExit();
                  }}
                  className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 hover:text-white active:scale-95 text-zinc-400 font-bold uppercase tracking-wider text-xs border border-zinc-880 transition-all cursor-pointer"
                >
                  กลับหน้าหลัก (EXIT TO MENU)
                </button>
              </div>

              <div className="text-[9px] text-zinc-600 uppercase font-mono mt-5 tracking-widest">
                PRESS ESC OR PRESS THE BUTTON TO PLAY
              </div>
            </div>
          </div>
        )}

        {/* Keyboard instructions overlay */}
        <div className="absolute bottom-3 left-4 text-[9px] text-zinc-500 font-mono bg-black/80 border border-zinc-900/50 px-2.5 py-1.5 rounded-none uppercase tracking-wider">
          MOVE: WASD/Arrows | P: Attack • Punch | O: Sacred Dance • Purify Aura | ESC: Pause
        </div>
      </div>

      {/* Touch Screen Virtual Controller Overlays */}
      {options.showOnScreenButtons && (
        <div className="grid grid-cols-12 items-center px-8 py-5 bg-zinc-950 border-t border-zinc-900 gap-4 font-kanit select-none">
          
          {/* Movement Joystic / Arrows on Left (cols-span-5) */}
          <div className="col-span-5 flex justify-center items-center">
            <div className="grid grid-cols-3 gap-1.5 w-36 h-36 p-1 bg-zinc-900/40 border border-zinc-900 rounded-full relative">
              {/* Spacer */}
              <div></div>
              {/* Up */}
              <button
                onMouseDown={() => { inputsRef.current.up = true; }}
                onMouseUp={() => { inputsRef.current.up = false; }}
                onMouseLeave={() => { inputsRef.current.up = false; }}
                onTouchStart={(e) => { e.preventDefault(); inputsRef.current.up = true; }}
                onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.up = false; }}
                className="w-10 h-10 bg-zinc-900 active:bg-red-600 active:scale-95 text-zinc-400 active:text-white flex items-center justify-center border border-zinc-800 rounded-sm cursor-pointer mx-auto"
              >
                ▲
              </button>
              {/* Spacer */}
              <div></div>

              {/* Left */}
              <button
                onMouseDown={() => { inputsRef.current.left = true; }}
                onMouseUp={() => { inputsRef.current.left = false; }}
                onMouseLeave={() => { inputsRef.current.left = false; }}
                onTouchStart={(e) => { e.preventDefault(); inputsRef.current.left = true; }}
                onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.left = false; }}
                className="w-10 h-10 bg-zinc-900 active:bg-red-600 active:scale-95 text-zinc-400 active:text-white flex items-center justify-center border border-zinc-800 rounded-sm cursor-pointer mx-auto"
              >
                ◀
              </button>
              {/* Center sacred coin */}
              <div className="w-10 h-10 bg-zinc-950 border border-zinc-900 rounded-full flex items-center justify-center text-[10px] text-zinc-700 font-bold mx-auto">
                PAD
              </div>
              {/* Right */}
              <button
                onMouseDown={() => { inputsRef.current.right = true; }}
                onMouseUp={() => { inputsRef.current.right = false; }}
                onMouseLeave={() => { inputsRef.current.right = false; }}
                onTouchStart={(e) => { e.preventDefault(); inputsRef.current.right = true; }}
                onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.right = false; }}
                className="w-10 h-10 bg-zinc-900 active:bg-red-600 active:scale-95 text-zinc-400 active:text-white flex items-center justify-center border border-zinc-800 rounded-sm cursor-pointer mx-auto"
              >
                ▶
              </button>

              {/* Spacer */}
              <div></div>
              {/* Down */}
              <button
                onMouseDown={() => { inputsRef.current.down = true; }}
                onMouseUp={() => { inputsRef.current.down = false; }}
                onMouseLeave={() => { inputsRef.current.down = false; }}
                onTouchStart={(e) => { e.preventDefault(); inputsRef.current.down = true; }}
                onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.down = false; }}
                className="w-10 h-10 bg-zinc-900 active:bg-red-600 active:scale-95 text-zinc-400 active:text-white flex items-center justify-center border border-zinc-800 rounded-sm cursor-pointer mx-auto"
              >
                ▼
              </button>
              {/* Spacer */}
              <div></div>
            </div>
          </div>

          {/* Guide Caption in center (cols-span-2) */}
          <div className="col-span-2 text-center flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">DAN SAI CONTROL</span>
            <span className="text-[9px] text-zinc-600 mt-1 uppercase">TOUCH/KEYBOARD ACTIVE</span>
          </div>

          {/* Action buttons on Right (cols-span-5) */}
          <div className="col-span-5 flex justify-center items-center gap-6">
            {/* PUNCH button */}
            <button
              onMouseDown={() => { inputsRef.current.punch = true; }}
              onMouseUp={() => { inputsRef.current.punch = false; }}
              onMouseLeave={() => { inputsRef.current.punch = false; }}
              onTouchStart={(e) => { e.preventDefault(); inputsRef.current.punch = true; }}
              onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.punch = false; }}
              className="w-20 h-20 bg-red-950/40 border border-red-800/80 hover:bg-red-900/20 active:bg-red-600 active:scale-95 flex flex-col items-center justify-center rounded-full shadow-[0_0_15px_rgba(220,38,38,0.2)] text-red-500 cursor-pointer"
            >
              <span className="text-xl font-black">P</span>
              <span className="text-[8px] uppercase tracking-widest mt-1 font-bold">PUNCH</span>
            </button>

            {/* DANCE button */}
            <button
              onMouseDown={() => { inputsRef.current.dance = true; }}
              onMouseUp={() => { inputsRef.current.dance = false; }}
              onMouseLeave={() => { inputsRef.current.dance = false; }}
              onTouchStart={(e) => { e.preventDefault(); inputsRef.current.dance = true; }}
              onTouchEnd={(e) => { e.preventDefault(); inputsRef.current.dance = false; }}
              className="w-20 h-20 bg-yellow-950/40 border border-yellow-800/80 hover:bg-yellow-900/20 active:bg-yellow-600 active:scale-95 flex flex-col items-center justify-center rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)] text-yellow-500 cursor-pointer"
            >
              <span className="text-xl font-black">O</span>
              <span className="text-[8px] uppercase tracking-widest mt-1 font-bold">DANCE</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
