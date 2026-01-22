import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Play, Pause, RotateCcw, Upload, Box, Settings, Loader2, Sun, Moon, 
  CloudSun, Maximize, Target, MousePointer2, Image as ImageIcon, 
  Trash2, Grid, Zap, Sunrise, Palette, Camera as CameraIcon, Hash, 
  SlidersHorizontal, Aperture, ChevronDown, ChevronUp, ChevronLeft, 
  X, Monitor, Check, Eye, EyeOff, Plus, Hash as HashIcon, ListTree, 
  Edit2, CheckCircle2, Package, Activity, RefreshCw, Scan, Focus, 
  Shapes, Wand2, Droplets, Camera, Download, Layers, Ruler, BarChart3
} from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type LightingPreset = 'studio' | 'dramatic' | 'outdoor' | 'neon' | 'sunset' | 'flat';
type ViewMode = 'front' | 'side' | 'free';
type TextureType = 'map' | 'metalnessMap' | 'roughnessMap' | 'normalMap' | 'aoMap' | 'emissiveMap' | 'alphaMap' | 'matcap';
type TabType = 'hierarchy' | 'scene' | 'material' | 'light';

interface UserPreset {
  id: string;
  name: string;
  uiBg: string;
  viewportBg: string;
  accent: string;
  text: string;
  grid: string;
  isDark: boolean;
}

interface HierarchyItem {
  uuid: string;
  name: string;
  visible: boolean;
}

interface ModelStats {
  vertices: number;
  triangles: number;
  name: string;
  objectCount: number;
}

interface AppliedTextures {
  map: string | null;
  metalnessMap: string | null;
  roughnessMap: string | null;
  normalMap: string | null;
  aoMap: string | null;
  emissiveMap: string | null;
  alphaMap: string | null;
  matcap: string | null;
}

const APP_VERSION = "V5.3.0 ELITE";

const MATCAP_PRESETS = [
  { id: 'obsidian', name: 'Obsidian', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/5B5B5B_B7B7B7_111111_2C2C2C-512px.jpg' },
  { id: 'chrome', name: 'Chrome', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/616161_D7D7D7_A9A9A9_B2B2B2-512px.jpg' },
  { id: 'clay', name: 'Clay', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/653E35_C19081_8F5D51_A5786D-512px.jpg' },
  { id: 'gold', name: 'Liquid Gold', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/7877EE_D87FC5_75D9C7_1C78C0-512px.jpg' },
  { id: 'emerald', name: 'Emerald', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/3B6E47_B9D8B1_79A27D_94C297-512px.jpg' },
  { id: 'ruby', name: 'Ruby', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/A11D1D_E45E5E_6D1212_7F1A1A-512px.jpg' },
  { id: 'pearl', name: 'Pearl', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/B7B7B7_6D6D6D_8C8C8C_A4A4A4-512px.jpg' },
  { id: 'plastic', name: 'Matte Grey', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/3B3B3B_A2A2A2_7B7B7B_848484-512px.jpg' },
  { id: 'ceramic', name: 'Ceramic', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/D0D0D0_7A7A7A_9F9F9F_B1B1B1-512px.jpg' },
  { id: 'zred', name: 'ZBrush Red', url: 'https://raw.githubusercontent.com/nidorx/matcaps/master/thumbnail/C0392B_E74C3C_922B21_A93226-512px.jpg' },
];

const CustomColorPicker = ({ 
  label, 
  value, 
  onChange, 
  presets = [] 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  presets?: string[] 
}) => {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => { setInputValue(value); }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) onChange(val);
  };

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-[1.75rem] border border-black/5 dark:border-white/5 transition-all">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-tight opacity-70">{label}</span>
        <div className="flex items-center gap-2">
           <div className="relative group/input">
              <HashIcon size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30" />
              <input 
                type="text" 
                value={inputValue.replace('#', '')} 
                onChange={handleHexChange}
                className="w-20 pl-6 pr-2 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[9px] font-mono font-bold uppercase outline-none focus:border-ui-accent/50"
                maxLength={6}
              />
           </div>
           <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer shadow-sm">
              <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none"
              />
           </div>
        </div>
      </div>
      {presets.length > 0 && (
        <div className="flex gap-1.5 flex-wrap pt-2 border-t border-black/5 dark:border-white/5">
          {presets.map((p) => (
            <button 
              key={p} 
              onClick={() => onChange(p)}
              className={`w-4 h-4 rounded-full border border-black/10 dark:border-white/10 transition-all ${value.toLowerCase() === p.toLowerCase() ? 'ring-2 ring-ui-accent ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: p }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StudioView3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);
  
  // App State
  const [activeTab, setActiveTab] = useState<TabType>('material');
  const [isRotating, setIsRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('free');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [exposure, setExposure] = useState(1.0);
  const [modelStats, setModelStats] = useState<ModelStats>({ vertices: 0, triangles: 0, name: 'No Asset', objectCount: 0 });
  
  // Theme & Viewport State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uiBgColor, setUiBgColor] = useState('#121212');
  const [uiAccentColor, setUiAccentColor] = useState('#6366f1');
  const [uiTextColor, setUiTextColor] = useState('#f8fafc');
  const [viewportBgColor, setViewportBgColor] = useState('#1a1a1a');
  const [gridColor, setGridColor] = useState('#475569');

  const [userPresets, setUserPresets] = useState<UserPreset[]>(() => {
    const saved = localStorage.getItem('studioview_user_presets_v6');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPresetName, setNewPresetName] = useState('');

  // Material State (standard PBR)
  const [modelColor, setModelColor] = useState('#ffffff');
  const [metalness, setMetalness] = useState(0.7);
  const [roughness, setRoughness] = useState(0.3);
  const [emissiveIntensity, setEmissiveIntensity] = useState(0.0);
  const [opacity, setOpacity] = useState(1.0);
  const [useMatcap, setUseMatcap] = useState(false);
  
  // FX State
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineThickness, setOutlineThickness] = useState(2.0);
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [wireframe, setWireframe] = useState(false);
  const [wireframeColor, setWireframeColor] = useState('#6366f1');
  const [showGrid, setShowGrid] = useState(true);

  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [activeTextureNode, setActiveTextureNode] = useState<TextureType | null>(null);
  const [appliedTextures, setAppliedTextures] = useState<AppliedTextures>({
    map: null, metalnessMap: null, roughnessMap: null, normalMap: null, aoMap: null, emissiveMap: null, alphaMap: null, matcap: null
  });
  
  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group>(new THREE.Group());
  const wireframeGroupRef = useRef<THREE.Group>(new THREE.Group());
  const outlineGroupRef = useRef<THREE.Group>(new THREE.Group());
  const lightsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const materialsRef = useRef<THREE.Material[]>([]);
  const outlineMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const wireframeMaterialsRef = useRef<THREE.LineBasicMaterial[]>([]);
  const loadedTexturesRef = useRef<Partial<Record<TextureType, THREE.Texture>>>({});

  const gltfLoader = useRef(new GLTFLoader());
  const fbxLoader = useRef(new FBXLoader());
  const textureLoader = useRef(new THREE.TextureLoader());

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTextureNode) return;
    const url = URL.createObjectURL(file);
    textureLoader.current.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      loadedTexturesRef.current[activeTextureNode] = texture;
      setAppliedTextures(prev => ({ ...prev, [activeTextureNode]: url }));
      applyTextureSlotsToModel();
    });
  };

  const fastUpdateMaterials = useCallback(() => {
    const color = new THREE.Color(modelColor);
    const outlineCol = new THREE.Color(outlineColor);
    const wireCol = new THREE.Color(wireframeColor);

    materialsRef.current.forEach(mat => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.color.copy(color);
        mat.metalness = metalness;
        mat.roughness = roughness;
        mat.emissive.copy(color);
        mat.emissiveIntensity = emissiveIntensity;
        mat.opacity = opacity;
        mat.transparent = opacity < 1.0;
        mat.needsUpdate = true;
      } else if (mat instanceof THREE.MeshMatcapMaterial) {
        mat.color.copy(color);
        mat.opacity = opacity;
        mat.transparent = opacity < 1.0;
        mat.needsUpdate = true;
      }
    });

    outlineMaterialsRef.current.forEach(mat => {
      mat.uniforms.outlineThickness.value = outlineThickness;
      mat.uniforms.outlineColor.value.copy(outlineCol);
    });

    wireframeMaterialsRef.current.forEach(mat => {
      mat.color.copy(wireCol);
      mat.needsUpdate = true;
    });

    if (rendererRef.current) rendererRef.current.setClearColor(viewportBgColor);
    if (sceneRef.current) sceneRef.current.background = new THREE.Color(viewportBgColor);
  }, [modelColor, metalness, roughness, emissiveIntensity, opacity, outlineThickness, outlineColor, wireframeColor, viewportBgColor]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene(); 
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000); 
    camera.position.set(5, 3, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); 
    controls.enableDamping = true;
    scene.add(modelGroupRef.current, wireframeGroupRef.current, outlineGroupRef.current, lightsGroupRef.current);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer; controlsRef.current = controls;
    createPrimitive('knot');
    const animate = () => { if (controlsRef.current) { controlsRef.current.autoRotate = isRotatingRef.current; controlsRef.current.update(); } renderer.render(scene, camera); };
    renderer.setAnimationLoop(animate);
    const resize = () => { if (!containerRef.current) return; camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight); };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); renderer.setAnimationLoop(null); renderer.dispose(); };
  }, []);

  const isRotatingRef = useRef(false);
  useEffect(() => { isRotatingRef.current = isRotating; }, [isRotating]);
  useEffect(() => { setupLighting(lightingPreset); }, [lightingPreset]);
  useEffect(() => { if (rendererRef.current) rendererRef.current.toneMappingExposure = exposure; }, [exposure]);

  const rebuildRegistry = (object: THREE.Object3D) => {
    materialsRef.current = [];
    outlineMaterialsRef.current = [];
    wireframeMaterialsRef.current = [];
    const items: HierarchyItem[] = [];
    let verts = 0;
    let tris = 0;
    let objs = 0;

    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        objs++;
        // Enforce Material Inheritance
        if (!(child.material instanceof THREE.MeshStandardMaterial) && !(child.material instanceof THREE.MeshMatcapMaterial)) {
          const oldMat = child.material;
          const newMat = new THREE.MeshStandardMaterial();
          if (oldMat.map) newMat.map = oldMat.map;
          if (oldMat.color) newMat.color.copy(oldMat.color);
          if (oldMat.opacity !== undefined) newMat.opacity = oldMat.opacity;
          if (oldMat.transparent !== undefined) newMat.transparent = oldMat.transparent;
          child.material = newMat;
        }

        if (Array.isArray(child.material)) materialsRef.current.push(...child.material);
        else materialsRef.current.push(child.material);
        items.push({ uuid: child.uuid, name: child.name || 'Unnamed Mesh', visible: child.visible });
        
        // Stats calculation
        if (child.geometry) {
          verts += child.geometry.attributes.position.count;
          if (child.geometry.index) {
            tris += child.geometry.index.count / 3;
          } else {
            tris += child.geometry.attributes.position.count / 3;
          }
        }
      }
    });

    outlineGroupRef.current?.traverse(child => { if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) outlineMaterialsRef.current.push(child.material); });
    wireframeGroupRef.current?.traverse(child => { if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) wireframeMaterialsRef.current.push(child.material); });
    
    setHierarchy(items);
    setModelStats({ 
      vertices: verts, 
      triangles: Math.round(tris), 
      name: object.name || 'Loaded Asset',
      objectCount: objs
    });
    fastUpdateMaterials();
  };

  const createOutlineMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: { outlineThickness: { value: outlineThickness }, outlineColor: { value: new THREE.Color(outlineColor) } },
      vertexShader: `uniform float outlineThickness; void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vec3 projectedNormal = normalize(normalMatrix * normal); mvPosition.xyz += projectedNormal * outlineThickness * 0.005 * (-mvPosition.z / 10.0); gl_Position = projectionMatrix * mvPosition; }`,
      fragmentShader: `uniform vec3 outlineColor; void main() { gl_FragColor = vec4(outlineColor, 1.0); }`,
      side: THREE.BackSide, transparent: true
    });
  };

  const createPrimitive = (type: string) => {
    let geometry;
    switch(type) {
      case 'cube': geometry = new THREE.BoxGeometry(2, 2, 2); break;
      case 'sphere': geometry = new THREE.SphereGeometry(1.5, 64, 64); break;
      case 'knot': geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32); break;
      default: geometry = new THREE.BoxGeometry(2, 2, 2);
    }
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    mesh.name = type.charAt(0).toUpperCase() + type.slice(1);
    updateModel(mesh);
  };

  const updateModel = (object: THREE.Object3D) => {
    if (!modelGroupRef.current || !wireframeGroupRef.current || !outlineGroupRef.current) return;
    [modelGroupRef.current, wireframeGroupRef.current, outlineGroupRef.current].forEach(g => {
      while(g.children.length > 0) {
        const c = g.children[0]; g.remove(c);
        c.traverse((n: any) => { if (n.geometry) n.geometry.dispose(); if (n.material) Array.isArray(n.material) ? n.material.forEach((m: any) => m.dispose()) : n.material.dispose(); });
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3(); box.getCenter(center); object.position.sub(center);
    const size = new THREE.Vector3(); box.getSize(size);
    object.scale.setScalar(3 / Math.max(size.x, size.y, size.z));
    object.updateMatrixWorld(true);
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const wire = new THREE.LineSegments(new THREE.WireframeGeometry(child.geometry));
        wire.applyMatrix4(child.matrixWorld);
        wire.material = new THREE.LineBasicMaterial({ color: wireframeColor, transparent: true, opacity: 0.5 });
        wireframeGroupRef.current!.add(wire);
        const out = new THREE.Mesh(child.geometry, createOutlineMaterial());
        out.applyMatrix4(child.matrixWorld);
        outlineGroupRef.current!.add(out);
      }
    });
    
    modelGroupRef.current.add(object);
    rebuildRegistry(modelGroupRef.current);
    applyTextureSlotsToModel();
    fastUpdateMaterials();
  };

  const applyTextureSlotsToModel = () => {
    if (!modelGroupRef.current) return;
    
    modelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const currentMat = child.material;
        
        if (useMatcap) {
          if (!(currentMat instanceof THREE.MeshMatcapMaterial)) {
            const newMat = new THREE.MeshMatcapMaterial({ 
              color: new THREE.Color(modelColor),
              opacity: opacity,
              transparent: opacity < 1.0,
              matcap: loadedTexturesRef.current.matcap || null
            });
            child.material = newMat;
          } else {
            (currentMat as THREE.MeshMatcapMaterial).matcap = loadedTexturesRef.current.matcap || null;
            currentMat.needsUpdate = true;
          }
        } else {
          if (!(currentMat instanceof THREE.MeshStandardMaterial)) {
            const newMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(modelColor),
              metalness: metalness,
              roughness: roughness,
              emissive: new THREE.Color(modelColor),
              emissiveIntensity: emissiveIntensity,
              opacity: opacity,
              transparent: opacity < 1.0
            });
            // Re-apply existing PBR textures
            Object.entries(loadedTexturesRef.current).forEach(([slot, tex]) => {
              if (slot !== 'matcap') (newMat as any)[slot] = tex;
            });
            child.material = newMat;
          }
        }
      }
    });

    // Refresh material registry since references might have changed
    materialsRef.current = [];
    modelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) materialsRef.current.push(...child.material);
        else materialsRef.current.push(child.material);
      }
    });
    
    fastUpdateMaterials();
  };

  const setupLighting = (preset: LightingPreset) => {
    if (!lightsGroupRef.current) return;
    while(lightsGroupRef.current.children.length > 0) lightsGroupRef.current.remove(lightsGroupRef.current.children[0]);
    const ambient = new THREE.AmbientLight(0xffffff, preset === 'flat' ? 2.5 : 0.2);
    lightsGroupRef.current.add(ambient);
    if (preset === 'studio') {
      const key = new THREE.DirectionalLight(0xfff5e6, 1.2); key.position.set(5, 5, 5);
      const fill = new THREE.DirectionalLight(0xe6f5ff, 0.4); fill.position.set(-5, 3, 2);
      lightsGroupRef.current.add(key, fill);
    } else if (preset === 'dramatic') {
      const spot = new THREE.SpotLight(0xffffff, 20); spot.position.set(2, 8, 4);
      lightsGroupRef.current.add(spot);
    }
  };

  const resetScene = () => {
    setModelColor('#ffffff');
    setMetalness(0.7);
    setRoughness(0.3);
    setEmissiveIntensity(0.0);
    setOpacity(1.0);
    setUseMatcap(false);
    setOutlineEnabled(false);
    setOutlineThickness(2.0);
    setOutlineColor('#000000');
    setWireframe(false);
    setWireframeColor('#6366f1');
    setShowGrid(true);
    setViewportBgColor('#1a1a1a');
    setGridColor('#475569');
    setExposure(1.0);
    setLightingPreset('studio');
    setUiAccentColor('#6366f1');
    setUiBgColor('#121212');
    setUiTextColor('#f8fafc');
    setIsDarkMode(true);
    setAppliedTextures({ map: null, metalnessMap: null, roughnessMap: null, normalMap: null, aoMap: null, emissiveMap: null, alphaMap: null, matcap: null });
    loadedTexturesRef.current = {};
    setViewMode('free');
    if (controlsRef.current) { controlsRef.current.reset(); controlsRef.current.enabled = true; }
    createPrimitive('knot');
    setActiveTab('material');
  };

  const saveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const preset: UserPreset = { 
      id: Date.now().toString(), 
      name: newPresetName, 
      uiBg: uiBgColor, 
      viewportBg: viewportBgColor, 
      accent: uiAccentColor, 
      text: uiTextColor, 
      grid: gridColor,
      isDark: isDarkMode 
    };
    const next = [...userPresets, preset];
    setUserPresets(next);
    localStorage.setItem('studioview_user_presets_v6', JSON.stringify(next));
    setNewPresetName('');
  };

  const loadPreset = (p: UserPreset) => {
    setUiBgColor(p.uiBg);
    setViewportBgColor(p.viewportBg);
    setUiAccentColor(p.accent);
    setUiTextColor(p.text);
    setGridColor(p.grid || '#475569');
    setIsDarkMode(p.isDark);
  };

  const applyThemePreset = (id: 'classic' | 'cyber' | 'titanium' | 'obsidian' | 'highcontrast' | 'nord' | 'midnight') => {
    switch (id) {
      case 'classic': setUiAccentColor('#6366f1'); setUiBgColor('#121212'); setUiTextColor('#f8fafc'); setViewportBgColor('#1a1a1a'); setGridColor('#475569'); setIsDarkMode(true); break;
      case 'cyber': setUiAccentColor('#f0abfc'); setUiBgColor('#000000'); setUiTextColor('#ffffff'); setViewportBgColor('#050505'); setGridColor('#333333'); setIsDarkMode(true); break;
      case 'titanium': setUiAccentColor('#475569'); setUiBgColor('#f0f0f0'); setUiTextColor('#0f172a'); setViewportBgColor('#ffffff'); setGridColor('#cccccc'); setIsDarkMode(false); break;
      case 'obsidian': setUiAccentColor('#fbbf24'); setUiBgColor('#121212'); setUiTextColor('#ffffff'); setViewportBgColor('#111111'); setGridColor('#222222'); setIsDarkMode(true); break;
      case 'highcontrast': setUiAccentColor('#ffff00'); setUiBgColor('#000000'); setUiTextColor('#ffffff'); setViewportBgColor('#000000'); setGridColor('#ffffff'); setIsDarkMode(true); break;
      case 'nord': setUiAccentColor('#88c0d0'); setUiBgColor('#2e3440'); setUiTextColor('#eceff4'); setViewportBgColor('#3b4252'); setGridColor('#4c566a'); setIsDarkMode(true); break;
      case 'midnight': setUiAccentColor('#7c3aed'); setUiBgColor('#020617'); setUiTextColor('#f1f5f9'); setViewportBgColor('#0f172a'); setGridColor('#1e293b'); setIsDarkMode(true); break;
    }
  };

  const saveScreenshot = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.download = `studioview-capture-${Date.now()}.png`;
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.click();
  };

  useEffect(() => { if (outlineGroupRef.current) outlineGroupRef.current.visible = outlineEnabled; }, [outlineEnabled]);
  useEffect(() => { if (wireframeGroupRef.current) wireframeGroupRef.current.visible = wireframe; }, [wireframe]);
  useEffect(() => {
    if (!sceneRef.current) return;
    if (gridHelperRef.current) sceneRef.current.remove(gridHelperRef.current);
    const grid = new THREE.GridHelper(20, 40, gridColor, new THREE.Color(gridColor).clone().multiplyScalar(0.2)); 
    grid.position.y = -2; grid.visible = showGrid;
    sceneRef.current.add(grid); gridHelperRef.current = grid;
  }, [gridColor, showGrid]);
  useEffect(() => { fastUpdateMaterials(); }, [fastUpdateMaterials]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const PBRNode = ({ label, type, children, map }: { label: string, type: TextureType, children?: React.ReactNode, map?: string | null }) => (
    <div className={`p-4 rounded-2xl border transition-all ${activeTextureNode === type ? 'bg-ui-accent/5 border-ui-accent/40' : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/5 dark:border-white/5'}`}>
      <button onClick={() => setActiveTextureNode(activeTextureNode === type ? null : type)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg relative overflow-hidden ${map ? 'bg-ui-accent/20 text-ui-accent' : 'bg-black/10 opacity-40'}`}>
            {map && type === 'matcap' ? <img src={map} className="absolute inset-0 w-full h-full object-cover" /> : <ImageIcon size={14}/>}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        {activeTextureNode === type ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {activeTextureNode === type && (
        <div className="pt-4 space-y-4 border-t border-black/10 dark:border-white/10 mt-4 animate-in fade-in">
          {children}
          {type !== 'matcap' && (
            <div className="flex items-center gap-2">
              <button onClick={() => textureInputRef.current?.click()} className="flex-1 p-2.5 bg-black/10 dark:bg-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-ui-accent/20 transition-all flex items-center justify-center gap-2"><Upload size={12}/> {map ? 'Replace Map' : 'Assign Map'}</button>
              {map && <button onClick={() => { setAppliedTextures(prev => ({...prev, [type]: null})); delete loadedTexturesRef.current[type]; applyTextureSlotsToModel(); }} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12}/></button>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ControlGroup = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }: { label: string, value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number }) => {
    const [localValue, setLocalValue] = useState(value.toString());
    useEffect(() => {
      if (parseFloat(localValue) !== value) setLocalValue(value.toString());
    }, [value]);

    return (
      <div className="group">
        <div className="flex justify-between text-[9px] font-black opacity-40 mb-1 uppercase"><span>{label}</span><span>{value.toFixed(2)}</span></div>
        <div className="flex items-center gap-3">
          <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="slider-custom flex-1" />
          <input 
            type="text" 
            value={localValue} 
            onChange={e => {
              const val = e.target.value;
              setLocalValue(val);
              const p = parseFloat(val);
              if (!isNaN(p)) onChange(p);
            }} 
            className="w-12 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg text-[9px] font-bold p-1 outline-none focus:border-ui-accent text-center" 
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden transition-all duration-500 ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ backgroundColor: uiBgColor, color: uiTextColor, '--ui-accent': uiAccentColor, '--ui-bg': uiBgColor, '--ui-text': uiTextColor } as any}>
      <div className="flex-1 relative flex flex-col">
        {isLoading && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"><Loader2 className="w-12 h-12 text-ui-accent animate-spin" /></div>}
        <header className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto"><h1 className="text-2xl font-black tracking-tighter flex items-center gap-3"><Box className="w-8 h-8" style={{ color: 'var(--ui-accent)' }} /> STUDIOVIEW 3D</h1><p className="text-[10px] font-bold opacity-40 tracking-[0.2em] mt-1 uppercase">ENGINEERING INSPECTOR {APP_VERSION}</p></div>
          <div className="flex gap-2 pointer-events-auto">
            <button onClick={saveScreenshot} title="Capture Screenshot" className="p-2.5 bg-black/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-black/20 transition-colors"><Download size={18}/></button>
            <button onClick={resetScene} title="Reset Scene" className="p-2.5 bg-black/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-black/20 transition-colors"><RotateCcw size={18}/></button>
            <button onClick={() => setShowSettings(true)} title="Settings" className="p-2.5 bg-black/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-black/20 transition-colors"><Settings size={18}/></button>
            <button onClick={() => setIsRotating(!isRotating)} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all ${isRotating ? 'bg-rose-600 text-white' : 'bg-black/10 backdrop-blur-xl border border-white/5 hover:bg-black/20'}`}>{isRotating ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}{isRotating ? 'Stop' : 'Spin'}</button>
          </div>
        </header>
        <div ref={containerRef} className="flex-1" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/5 dark:bg-white/5 backdrop-blur-3xl border border-black/10 dark:border-white/10 p-1.5 rounded-3xl shadow-2xl pointer-events-auto">
          {['front', 'side', 'free'].map(v => (
            <button key={v} onClick={() => { setViewMode(v as any); if (controlsRef.current) { if (v === 'free') controlsRef.current.enabled = true; else { controlsRef.current.reset(); const d = cameraRef.current!.position.length(); if (v === 'front') cameraRef.current!.position.set(0,0,d||7); else cameraRef.current!.position.set(d||7,0,0); cameraRef.current!.lookAt(0,0,0); controlsRef.current.update(); } } }} className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === v ? 'bg-ui-accent text-white shadow-xl' : 'opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`} style={viewMode === v ? { backgroundColor: uiAccentColor } : {}}>{v}</button>
          ))}
        </div>

        <aside className={`absolute right-6 top-24 bottom-6 ${isSidebarMinimized ? 'w-16' : 'w-80 md:w-96'} bg-black/[0.05] dark:bg-white/[0.05] backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden z-10 transition-all duration-500 ease-in-out`}>
          <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 shrink-0">
            {!isSidebarMinimized ? (
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2 animate-in fade-in"><Activity size={14}/> {activeTab}</h2>
            ) : (
              <div className="w-full flex justify-center"><BarChart3 size={16} className="opacity-40" /></div>
            )}
            {!isSidebarMinimized && <button onClick={() => setIsSidebarMinimized(true)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 opacity-40 hover:opacity-100 transition-all rotate-180"><ChevronLeft size={18}/></button>}
          </div>

          {isSidebarMinimized ? (
            <div className="flex-1 flex flex-col items-center py-6 gap-8 animate-in fade-in slide-in-from-right-2 overflow-y-auto no-scrollbar relative">
               <button onClick={() => setIsSidebarMinimized(false)} className="p-3 rounded-2xl bg-black/10 hover:bg-ui-accent hover:text-white transition-all shadow-lg active:scale-95"><ChevronLeft size={18}/></button>
               
               <div className="flex flex-col items-center gap-10 mt-4 group">
                 <div className="flex flex-col items-center gap-1 relative group/stat">
                    <Layers size={14} className="opacity-30 group-hover/stat:opacity-100 group-hover/stat:text-ui-accent transition-all" />
                    <span className="text-[8px] font-black rotate-90 mt-4 whitespace-nowrap opacity-30 group-hover/stat:opacity-100 transition-all">P {formatNumber(modelStats.triangles)}</span>
                    <div className="absolute right-12 bg-black/90 text-white text-[8px] px-3 py-2 rounded-xl hidden group-hover/stat:block whitespace-nowrap border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-1">
                      Polygons: {modelStats.triangles.toLocaleString()}
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-1 relative group/stat">
                    <Focus size={14} className="opacity-30 group-hover/stat:opacity-100 group-hover/stat:text-ui-accent transition-all" />
                    <span className="text-[8px] font-black rotate-90 mt-4 whitespace-nowrap opacity-30 group-hover/stat:opacity-100 transition-all">V {formatNumber(modelStats.vertices)}</span>
                    <div className="absolute right-12 bg-black/90 text-white text-[8px] px-3 py-2 rounded-xl hidden group-hover/stat:block whitespace-nowrap border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-1">
                      Vertices: {modelStats.vertices.toLocaleString()}
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-1 relative group/stat">
                    <Package size={14} className="opacity-30 group-hover/stat:opacity-100 group-hover/stat:text-ui-accent transition-all" />
                    <span className="text-[8px] font-black rotate-90 mt-4 whitespace-nowrap opacity-30 group-hover/stat:opacity-100 transition-all">OBJ {modelStats.objectCount}</span>
                    <div className="absolute right-12 bg-black/90 text-white text-[8px] px-3 py-2 rounded-xl hidden group-hover/stat:block whitespace-nowrap border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-1">
                      Object Count: {modelStats.objectCount}
                    </div>
                 </div>
               </div>

               <div className="mt-auto flex flex-col items-center gap-2 group">
                 <Package size={14} className="opacity-10" />
                 <span className="text-[7px] font-black rotate-90 mt-8 whitespace-nowrap opacity-10 uppercase tracking-widest">MINIMIZED</span>
               </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                {(['material', 'scene', 'hierarchy', 'light'] as TabType[]).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? 'border-b-2' : 'opacity-30 hover:opacity-100'}`} style={activeTab === tab ? { borderColor: uiAccentColor, color: uiAccentColor } : {}}>{tab}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {activeTab === 'material' && (
                  <>
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] flex items-center gap-2"><Scan size={16}/> Viewport FX</h3>
                      <div className={`p-5 rounded-[2rem] border transition-all ${outlineEnabled ? 'bg-ui-accent/5 border-ui-accent/30' : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/5 dark:border-white/5 opacity-50'}`}>
                          <button onClick={() => setOutlineEnabled(!outlineEnabled)} className="w-full flex items-center justify-between"><div className="flex items-center gap-3"><Zap size={18}/><span className="text-[11px] font-black uppercase">Edge Detection</span></div><div className={`w-8 h-4 rounded-full relative transition-colors ${outlineEnabled ? 'bg-ui-accent' : 'bg-slate-300 dark:bg-slate-700'}`} style={outlineEnabled ? { backgroundColor: uiAccentColor } : {}}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${outlineEnabled ? 'left-4.5' : 'left-0.5'}`} /></div></button>
                          {outlineEnabled && (<div className="space-y-4 pt-5 border-t border-black/10 dark:border-white/10 mt-5 animate-in fade-in">
                              <ControlGroup label="Pixel Thickness" value={outlineThickness} onChange={setOutlineThickness} min={0} max={10} step={0.1} />
                              <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/10 dark:border-white/10"><Palette size={14} className="opacity-30" /><input type="color" value={outlineColor} onChange={e => setOutlineColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" /><span className="text-[10px] font-mono opacity-50 uppercase">{outlineColor}</span></div>
                            </div>)}
                      </div>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] flex items-center gap-2"><ImageIcon size={16}/> PBR Nodes</h3>
                      <PBRNode label="Albedo / Base Color" type="map" map={appliedTextures.map}><div className="flex items-center gap-4 bg-black/[0.03] dark:bg-white/[0.03] p-3 rounded-2xl border border-black/10 dark:border-white/10"><input type="color" value={modelColor} onChange={e => setModelColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none" /><div className="flex flex-col"><span className="text-[10px] font-black uppercase">Color Tint</span><span className="text-[9px] font-mono opacity-40 uppercase">{modelColor}</span></div></div></PBRNode>
                      <PBRNode label="Metallic" type="metalnessMap" map={appliedTextures.metalnessMap}><ControlGroup label="Conductivity Factor" value={metalness} onChange={setMetalness} /></PBRNode>
                      <PBRNode label="Roughness" type="roughnessMap" map={appliedTextures.roughnessMap}><ControlGroup label="Roughness Factor" value={roughness} onChange={setRoughness} /></PBRNode>
                      <PBRNode label="Normal Map" type="normalMap" map={appliedTextures.normalMap} />
                      <PBRNode label="Emissive" type="emissiveMap" map={appliedTextures.emissiveMap}><ControlGroup label="Intensity Scale" value={emissiveIntensity} onChange={setEmissiveIntensity} min={0} max={10} /></PBRNode>
                      <PBRNode label="Opacity / Alpha" type="alphaMap" map={appliedTextures.alphaMap}><ControlGroup label="Opacity Factor" value={opacity} onChange={setOpacity} /></PBRNode>
                      
                      {/* Expanded MatCap Suite */}
                      <PBRNode label="MatCap Suite" type="matcap" map={appliedTextures.matcap}>
                        <div className="space-y-4">
                          <button onClick={() => { setUseMatcap(!useMatcap); setTimeout(applyTextureSlotsToModel, 10); }} className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${useMatcap ? 'bg-ui-accent text-white' : 'bg-black/10 opacity-40'}`} style={useMatcap ? { backgroundColor: uiAccentColor } : {}}>
                            {useMatcap ? <Check size={14}/> : <Box size={14}/>} {useMatcap ? 'Override Active' : 'Enable Override'}
                          </button>
                          <div className="grid grid-cols-5 gap-2.5">
                            {MATCAP_PRESETS.map(p => (
                              <button 
                                key={p.id} 
                                title={p.name}
                                onClick={() => { 
                                  setUseMatcap(true); 
                                  setAppliedTextures(prev => ({...prev, matcap: p.url})); 
                                  textureLoader.current.load(p.url, t => { 
                                    t.colorSpace = THREE.SRGBColorSpace; 
                                    loadedTexturesRef.current.matcap = t; 
                                    applyTextureSlotsToModel(); 
                                  }); 
                                }} 
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${appliedTextures.matcap === p.url && useMatcap ? 'border-ui-accent ring-2 ring-ui-accent/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              >
                                <img src={p.url} className="w-full h-full object-cover"/>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setActiveTextureNode('matcap'); textureInputRef.current?.click(); }} className="flex-1 p-2 bg-black/10 dark:bg-white/10 rounded-xl text-[8px] font-black uppercase hover:bg-ui-accent/20 transition-all">Custom Upload</button>
                            {appliedTextures.matcap && <button onClick={() => { setAppliedTextures(prev => ({...prev, matcap: null})); delete loadedTexturesRef.current.matcap; applyTextureSlotsToModel(); }} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12}/></button>}
                          </div>
                        </div>
                      </PBRNode>
                      
                      <input ref={textureInputRef} type="file" accept="image/*" onChange={handleTextureUpload} className="hidden" />
                    </section>
                  </>
                )}
                {activeTab === 'scene' && (
                  <div className="space-y-6">
                    <section className="space-y-3"><h3 className="text-[10px] font-black opacity-40 uppercase">Injection</h3><button onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-ui-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95" style={{ backgroundColor: uiAccentColor }}><Upload size={16}/> Push Asset</button><input ref={fileInputRef} type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setIsLoading(true); const u = URL.createObjectURL(f); if (f.name.toLowerCase().endsWith('.fbx')) fbxLoader.current.load(u, (m) => { updateModel(m); setIsLoading(false); }); else gltfLoader.current.load(u, (g) => { updateModel(g.scene); setIsLoading(false); }); } }} className="hidden" /></section>
                    
                    <section className="space-y-3"><h3 className="text-[10px] font-black opacity-40 uppercase">Overlays</h3>
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                        <button onClick={() => setWireframe(!wireframe)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${wireframe ? 'bg-ui-accent/10 border-ui-accent/40 text-ui-accent' : 'opacity-40'}`}>
                          <div className="flex items-center gap-2"><Grid size={14}/> <span className="text-[9px] font-black uppercase">Wireframe Mesh</span></div>
                          {wireframe && <div className={`w-4 h-4 rounded-full border border-white/20`} style={{ backgroundColor: wireframeColor }} />}
                        </button>
                        {wireframe && (
                          <div className="pt-2 animate-in fade-in">
                             <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/10 dark:border-white/10"><Palette size={14} className="opacity-30" /><input type="color" value={wireframeColor} onChange={e => setWireframeColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" /><span className="text-[10px] font-mono opacity-50 uppercase">{wireframeColor}</span></div>
                          </div>
                        )}
                        <button onClick={() => setShowGrid(!showGrid)} className={`w-full flex items-center justify-between p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${showGrid ? 'bg-ui-accent/10 border-ui-accent/40 text-ui-accent' : 'opacity-40'}`}><Hash size={14}/> Matrix Grid</button>
                      </div>
                    </section>

                    <section className="space-y-3"><h3 className="text-[10px] font-black uppercase opacity-40">Environment</h3>
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase opacity-40">Viewport BG</span><input type="color" value={viewportBgColor} onChange={e => setViewportBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent shadow-sm" /></div>
                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase opacity-40">Grid Chroma</span><input type="color" value={gridColor} onChange={e => setGridColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent shadow-sm" /></div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black opacity-40 uppercase">Scene Statistics</h3>
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black opacity-40 uppercase">Objects</span>
                          <p className="text-sm font-black">{modelStats.objectCount}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black opacity-40 uppercase">Polygons</span>
                          <p className="text-sm font-black">{modelStats.triangles.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black opacity-40 uppercase">Vertices</span>
                          <p className="text-sm font-black">{modelStats.vertices.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black opacity-40 uppercase">Asset Name</span>
                          <p className="text-[10px] font-black truncate">{modelStats.name}</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3"><h3 className="text-[10px] font-black opacity-40 uppercase">Primitives</h3><div className="grid grid-cols-3 gap-2">{['cube', 'sphere', 'knot'].map(t => (<button key={t} onClick={() => createPrimitive(t)} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-black/10 transition-all">{t}</button>))}</div></section>
                  </div>
                )}
                {activeTab === 'hierarchy' && (<div className="space-y-2">{hierarchy.map(item => (<div key={item.uuid} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"><span className="text-[10px] font-black uppercase truncate">{item.name}</span><button onClick={() => { if (modelGroupRef.current) modelGroupRef.current.traverse(c => { if (c.uuid === item.uuid) { c.visible = !c.visible; setHierarchy(prev => prev.map(h => h.uuid === item.uuid ? {...h, visible: c.visible} : h)); } }); }} className="p-2 hover:bg-ui-accent/10 rounded-lg transition-colors">{item.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button></div>))}</div>)}
                {activeTab === 'light' && (
                  <div className="space-y-6">
                    <ControlGroup label="Global Exposure Intensity" value={exposure} onChange={setExposure} min={0.1} max={4} />
                    <div className="grid grid-cols-1 gap-2">{[{id:'studio',label:'Studio',icon:Maximize},{id:'dramatic',label:'Dramatic',icon:Moon},{id:'outdoor',label:'Outdoor',icon:CloudSun},{id:'flat',label:'Flat',icon:Sun}].map(p => (<button key={p.id} onClick={() => setLightingPreset(p.id as any)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${lightingPreset === p.id ? 'bg-ui-accent/10 border-ui-accent/40 shadow-inner' : 'bg-black/5 dark:bg-white/5 opacity-50'}`}><div className={`p-2 rounded-lg ${lightingPreset === p.id ? 'bg-ui-accent text-white' : 'bg-black/10 opacity-40'}`} style={lightingPreset === p.id ? { backgroundColor: uiAccentColor } : {}}><p.icon size={16} /></div><span className="text-[10px] font-black uppercase">{p.label}</span></button>))}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-ui-bg rounded-[3.5rem] border border-black/10 dark:border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-8 border-b border-black/5 flex justify-between items-center bg-black/[0.02] shrink-0">
              <div className="flex items-center gap-5"><div className="p-4 bg-ui-accent/10 rounded-[1.5rem]" style={{ color: uiAccentColor }}><Settings size={32} /></div><div><h2 className="text-2xl font-black uppercase tracking-tighter">Workspace Preferences</h2><p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.2em] mt-0.5">Configuration Hub</p></div></div>
              <button onClick={() => setShowSettings(false)} className="p-4 rounded-[1.5rem] hover:bg-black/5 border border-black/10 dark:border-white/10 transition-colors"><X size={24}/></button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3 opacity-60 border-b border-black/5 pb-5"><Monitor size={18}/><h3 className="text-[11px] font-black uppercase tracking-widest">Global Presets</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {['classic', 'cyber', 'titanium', 'obsidian', 'highcontrast', 'nord', 'midnight'].map(pId => (
                    <button key={pId} onClick={() => applyThemePreset(pId as any)} className="p-3 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-all text-[8px] font-black uppercase tracking-widest truncate">{pId}</button>
                  ))}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-3 opacity-60 border-b border-black/5 pb-5"><Palette size={18}/><h3 className="text-[11px] font-black uppercase tracking-widest">Interface Chroma</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CustomColorPicker label="Accent Hue" value={uiAccentColor} onChange={setUiAccentColor} presets={['#6366f1', '#f0abfc', '#475569', '#fbbf24', '#ffff00', '#88c0d0', '#7c3aed']} />
                    <CustomColorPicker label="Shell Base" value={uiBgColor} onChange={setUiBgColor} presets={['#121212', '#1a1a1a', '#0a0a0a', '#fcfcfc', '#f5f5f5', '#2e3440', '#020617']} />
                    <CustomColorPicker label="Typography" value={uiTextColor} onChange={setUiTextColor} presets={['#ffffff', '#f8fafc', '#0f172a', '#121212', '#eceff4', '#f1f5f9']} />
                </div>
                <div className="p-6 bg-black/5 rounded-3xl border border-black/5 flex items-center justify-between gap-4">
                   <input type="text" placeholder="Alias for custom preset..." value={newPresetName} onChange={e => setNewPresetName(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-black uppercase flex-1" />
                   <button onClick={saveCurrentPreset} className="px-6 py-3 bg-ui-accent text-white rounded-xl text-[10px] font-black uppercase whitespace-nowrap shadow-lg transition-transform active:scale-95" style={{ backgroundColor: uiAccentColor }}><Plus size={16} className="inline mr-2"/> Push Preset</button>
                </div>
                {userPresets.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                    {userPresets.map(p => (
                      <div key={p.id} className="relative group">
                        <button onClick={() => loadPreset(p)} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-[9px] font-black uppercase truncate pr-8 hover:bg-black/10 transition-all">{p.name}</button>
                        <button onClick={() => { const next = userPresets.filter(up => up.id !== p.id); setUserPresets(next); localStorage.setItem('studioview_user_presets_v6', JSON.stringify(next)); }} className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-3 opacity-60 border-b border-black/5 pb-5"><Droplets size={18}/><h3 className="text-[11px] font-black uppercase tracking-widest">Viewport System</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase opacity-40">Field Core (Background)</h4>
                    <CustomColorPicker label="Viewport Color" value={viewportBgColor} onChange={setViewportBgColor} presets={['#1a1a1a', '#121212', '#000000', '#ffffff', '#3b4252', '#0f172a']} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase opacity-40">Matrix Chroma (Grid)</h4>
                    <CustomColorPicker label="Grid Color" value={gridColor} onChange={setGridColor} presets={['#475569', '#334155', '#94a3b8', '#6366f1', '#ffffff', '#4c566a', '#1e293b']} />
                  </div>
                </div>
              </section>
            </div>
            <footer className="p-8 border-t border-black/10 bg-ui-bg flex gap-6 shrink-0">
              <button onClick={() => { setUiAccentColor('#6366f1'); setUiBgColor('#121212'); setViewportBgColor('#1a1a1a'); setGridColor('#475569'); setUiTextColor('#f8fafc'); setIsDarkMode(true); }} className="flex-1 p-5 border border-black/10 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black/5 transition-all"><RefreshCw size={16} className="inline mr-2"/> Restore Elite Defaults</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 p-5 bg-ui-accent text-white rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-transform active:scale-95" style={{ backgroundColor: uiAccentColor }}>Sync Session</button>
            </footer>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ui-accent); border-radius: 10px; opacity: 0.2; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .slider-custom { -webkit-appearance: none; height: 3px; background: rgba(128,128,128,0.1); border-radius: 5px; cursor: pointer; outline: none; }
        .slider-custom::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--ui-accent); border-radius: 50%; border: 2px solid var(--ui-text); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .dark-theme { color-scheme: dark; }
        .light-theme { color-scheme: light; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out forwards; }
        input[type=number]::-webkit-inner-spin-button { display: none; }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<StudioView3D />);