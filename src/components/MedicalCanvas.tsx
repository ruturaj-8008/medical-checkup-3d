import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MedicalCanvasProps {
  activeNode: string | null;
  onSelectNode: (node: string) => void;
  scanProgress: number;
  isScanning: boolean;
}

interface ScanNode {
  id: string;
  name: string;
  position: THREE.Vector3; // 3D space position
  screenPos: { x: number; y: number }; // Projected 2D screen coordinates
  description: string;
}

export const MedicalCanvas: React.FC<MedicalCanvasProps> = ({
  activeNode,
  onSelectNode,
  scanProgress,
  isScanning,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<ScanNode[]>([
    { id: 'brain', name: 'Cranial Cortex', position: new THREE.Vector3(0, 2.2, 0), screenPos: { x: 0, y: 0 }, description: 'Brain Activity & Cognitive Load' },
    { id: 'heart', name: 'Cardio System', position: new THREE.Vector3(-0.4, 0.7, 0.4), screenPos: { x: 0, y: 0 }, description: 'Heart Rate & EKG Diagnostics' },
    { id: 'lungs', name: 'Pulmonary Tract', position: new THREE.Vector3(0.5, 0.5, -0.4), screenPos: { x: 0, y: 0 }, description: 'Respiratory & Oxygen Saturation' },
    { id: 'abdomen', name: 'Metabolic Matrix', position: new THREE.Vector3(0, -0.8, 0.2), screenPos: { x: 0, y: 0 }, description: 'Digestive & Metabolic Vitals' },
  ]);

  const requestRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 4. Create 3D DNA Helix Particle System
    const dnaGroup = new THREE.Group();
    dnaGroupRef.current = dnaGroup;
    scene.add(dnaGroup);

    const particleCount = 280;
    const helixRadius = 1.3;
    const helixHeight = 5.5;
    const turns = 3;

    // Create particle geometries for 2 strands
    const strand1Geometry = new THREE.BufferGeometry();
    const strand2Geometry = new THREE.BufferGeometry();
    const strand1Positions = new Float32Array(particleCount * 3);
    const strand2Positions = new Float32Array(particleCount * 3);

    // Create rungs (lines connecting strands)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
    });

    const rungsGroup = new THREE.Group();
    dnaGroup.add(rungsGroup);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2 * turns;
      const y = (i / particleCount) * helixHeight - helixHeight / 2;
      
      // Strand 1
      const x1 = Math.cos(t) * helixRadius;
      const z1 = Math.sin(t) * helixRadius;
      
      strand1Positions[i * 3] = x1;
      strand1Positions[i * 3 + 1] = y;
      strand1Positions[i * 3 + 2] = z1;

      // Strand 2
      const x2 = Math.cos(t + Math.PI) * helixRadius;
      const z2 = Math.sin(t + Math.PI) * helixRadius;

      strand2Positions[i * 3] = x2;
      strand2Positions[i * 3 + 1] = y;
      strand2Positions[i * 3 + 2] = z2;

      // Periodic connecting lines (rungs)
      if (i % 6 === 0) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2),
        ]);
        const line = new THREE.Line(lineGeo, lineMaterial);
        rungsGroup.add(line);
      }
    }

    strand1Geometry.setAttribute('position', new THREE.BufferAttribute(strand1Positions, 3));
    strand2Geometry.setAttribute('position', new THREE.BufferAttribute(strand2Positions, 3));

    // Programmatic circle texture to avoid needing external image assets
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const dotTexture = new THREE.CanvasTexture(canvas);

    const particle1Material = new THREE.PointsMaterial({
      size: 0.12,
      map: dotTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particle2Material = new THREE.PointsMaterial({
      size: 0.12,
      map: dotTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const strand1 = new THREE.Points(strand1Geometry, particle1Material);
    const strand2 = new THREE.Points(strand2Geometry, particle2Material);
    
    dnaGroup.add(strand1);
    dnaGroup.add(strand2);

    // 5. Holographic Scan Cylinder/Ring
    const ringGeo = new THREE.RingGeometry(1.6, 1.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.y = -3;
    scene.add(scanRing);
    scanRingRef.current = scanRing;

    // Additional secondary scanning grid ring
    const innerRingGeo = new THREE.RingGeometry(1.78, 1.79, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff2a5f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    scanRing.add(innerRing);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff2a5f, 0.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 7. Event Handlers
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate DNA Helix
      if (dnaGroup) {
        // Spin speed depends on scanning status
        const rotSpeed = isScanning ? 0.8 : 0.25;
        dnaGroup.rotation.y = elapsedTime * rotSpeed;
        
        // Soft floating/wobbling effect
        dnaGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
      }

      // Animate Scan Ring height
      if (scanRing) {
        if (isScanning) {
          scanRing.visible = true;
          // Map progress 0-100 to y position -2.8 to 2.8
          const progressRatio = scanProgress / 100;
          scanRing.position.y = -2.8 + progressRatio * 5.6;
          
          // Speed pulsing color
          const pulseColor = Math.sin(elapsedTime * 12) > 0;
          ringMat.color.setHex(pulseColor ? 0x00f0ff : 0xff2a5f);
          ringMat.opacity = 0.5 + Math.sin(elapsedTime * 15) * 0.2;
        } else {
          // Idle floating scan ring
          scanRing.visible = true;
          scanRing.position.y = Math.sin(elapsedTime * 2) * 2.5;
          ringMat.color.setHex(0x00f0ff);
          ringMat.opacity = 0.25 + Math.sin(elapsedTime * 2) * 0.1;
        }
      }

      // Project 3D Node Positions onto 2D HTML Overlays
      if (camera && renderer && mountRef.current) {
        const widthHalf = mountRef.current.clientWidth / 2;
        const heightHalf = mountRef.current.clientHeight / 2;

        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            // Copy position to calculate transformation
            const vector = node.position.clone();
            
            // Apply DNA rotation matrix to the nodes to rotate them with the helix
            if (dnaGroup) {
              vector.applyEuler(dnaGroup.rotation);
              vector.add(dnaGroup.position);
            }

            // Project 3D vector to 2D camera viewport
            vector.project(camera);

            // Map projected coordinates to HTML px screen positions
            const x = (vector.x * widthHalf) + widthHalf;
            const y = -(vector.y * heightHalf) + heightHalf;

            return {
              ...node,
              screenPos: { x, y },
            };
          })
        );
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      renderer.dispose();
    };
  }, [isScanning, scanProgress]);

  // Handle manual interaction mouse effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dnaGroupRef.current || !mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    
    // Normalize coordinates (-1 to 1)
    const mouseX = (e.clientX - mountRef.current.getBoundingClientRect().left) / w * 2 - 1;
    const mouseY = -(e.clientY - mountRef.current.getBoundingClientRect().top) / h * 2 + 1;

    // Subtly tip DNA towards mouse
    if (!isScanning) {
      dnaGroupRef.current.rotation.x = mouseY * 0.35;
      dnaGroupRef.current.rotation.z = -mouseX * 0.35;
    }
  };

  const handleMouseLeave = () => {
    if (!dnaGroupRef.current || isScanning) return;
    // Reset tilt
    dnaGroupRef.current.rotation.x = 0;
    dnaGroupRef.current.rotation.z = 0;
  };

  return (
    <div 
      ref={mountRef} 
      className="relative w-full h-full cursor-crosshair overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ThreeJS Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Grid HUD Details */}
      <div className="grid-overlay" />
      <div className="hex-pattern" />

      {/* Futuristic Target Box Corner Elements (pure visual CSS) */}
      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-cyan opacity-40 pointer-events-none" />
      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-cyan opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-cyan opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-cyan opacity-40 pointer-events-none" />

      {/* Center Biometric Compass Hud */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-cyan/5 rounded-full spinning pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] border border-dashed border-cyan/10 rounded-full spinning reverse pointer-events-none" />

      {/* HTML Glowing Labels projected over 3D coordinates */}
      {nodes.map((node) => {
        const isActive = activeNode === node.id;
        
        // Hide if coordinates are out of bounds or default (to avoid flash on startup)
        if (node.screenPos.x === 0 && node.screenPos.y === 0) return null;

        return (
          <div
            key={node.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 z-20`}
            style={{
              left: `${node.screenPos.x}px`,
              top: `${node.screenPos.y}px`,
            }}
          >
            {/* Glow Core Dot */}
            <button
              onClick={() => onSelectNode(node.id)}
              className={`group flex items-center justify-center relative w-5 h-5 rounded-full border transition-all duration-300 focus:outline-none ${
                isActive 
                  ? 'bg-magenta border-magenta scale-125 shadow-[0_0_15px_#ff2a5f]' 
                  : 'bg-cyan/20 border-cyan hover:bg-cyan/50 hover:scale-110 hover:shadow-[0_0_10px_#00f0ff]'
              }`}
            >
              <span className={`absolute w-3 h-3 rounded-full ${isActive ? 'bg-white animate-ping' : 'bg-cyan opacity-75'}`} />
              
              {/* Tooltip Card (Projected Modern HUD Label) */}
              <div 
                className={`absolute left-8 flex flex-col gap-1 p-3 w-56 rounded-lg glass-panel text-left pointer-events-none opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${
                  isActive ? 'border-magenta/40 bg-color-bg-panel-solid' : 'border-cyan/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`hud-font text-xs font-bold ${isActive ? 'text-magenta' : 'text-cyan'}`}>
                    {node.name}
                  </span>
                  <span className="text-[9px] text-muted uppercase tracking-wider">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary leading-tight mt-1">
                  {node.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[9px] text-cyan/90 uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                  Click to scan node
                </div>
              </div>
            </button>
          </div>
        );
      })}

      {/* Floating Canvas Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none bg-black/35 backdrop-blur-md px-4 py-2 border border-white/5 rounded-full">
        <p className="text-[10px] text-text-secondary uppercase tracking-widest hud-font">
          Interactive Holographic DNA Model // Move mouse to tilt, click nodes to analyze
        </p>
      </div>
    </div>
  );
};
