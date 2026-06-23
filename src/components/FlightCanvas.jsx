import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FlightCanvas({ scrollProgress, activeStation }) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Use refs to store the scrolling progress and current station.
  // This allows the animation loop to read the latest prop values
  // without triggering a full re-initialization of the WebGL context on every frame/scroll.
  const scrollProgressRef = useRef(scrollProgress);
  const activeStationRef = useRef(activeStation);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    activeStationRef.current = activeStation;
  }, [activeStation]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    // Sky blue background
    scene.background = new THREE.Color(0xa5f3fc);
    // Add fog to smoothly fade landmarks in/out
    scene.fog = new THREE.FogExp2(0xa5f3fc, 0.018);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    // Initial camera placement
    camera.position.set(4, 3, 8);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lights setup
    // Soft ambient sky blue light
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    // Hemisphere light representing ground reflections
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb45309, 0.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Directional sun light casting crisp cartoon shadows
    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    sunLight.position.set(15, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 5. Procedural Ground/Terrain
    // A long strip of green landscape
    const groundGeo = new THREE.BoxGeometry(40, 4, 110);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // bright cartoon green
      roughness: 0.9,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -6, -25);
    ground.receiveShadow = true;
    scene.add(ground);

    // Dynamic grassy hills/mounds
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9, flatShading: true });
    const hills = [];
    const hillData = [
      { r: 4, x: -14, y: -4, z: 10 },
      { r: 6, x: 15, y: -5, z: 0 },
      { r: 5, x: -13, y: -4.5, z: -15 },
      { r: 7, x: 16, y: -5, z: -30 },
      { r: 5, x: -15, y: -4, z: -45 },
      { r: 8, x: 18, y: -6, z: -60 }
    ];
    hillData.forEach(h => {
      const geo = new THREE.SphereGeometry(h.r, 8, 8);
      const mesh = new THREE.Mesh(geo, hillMat);
      mesh.position.set(h.x, h.y, h.z);
      mesh.receiveShadow = true;
      scene.add(mesh);
      hills.push(mesh);
    });

    // 6. Tree generator
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9, flatShading: true });

    const createCartoonTree = (x, z) => {
      const tree = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.5, 5);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Leaves (layered cones for cartoon style)
      const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 5), leafMat);
      leaf1.position.y = 1.8;
      leaf1.castShadow = true;
      tree.add(leaf1);

      const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 5), leafMat);
      leaf2.position.y = 2.4;
      leaf2.castShadow = true;
      tree.add(leaf2);

      tree.position.set(x, -4, z);
      treeGroup.add(tree);
    };

    // Populate trees alongside the corridor
    for (let z = -65; z <= 20; z += 6) {
      // Left side trees
      const xLeft = -9 - Math.random() * 5;
      createCartoonTree(xLeft, z + (Math.random() - 0.5) * 2);
      
      // Right side trees
      const xRight = 9 + Math.random() * 5;
      createCartoonTree(xRight, z + (Math.random() - 0.5) * 2);
    }

    // 7. Cartoon Cloud Generator
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    const clouds = [];

    const createCartoonCloud = (x, y, z) => {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });

      const parts = [
        { geo: new THREE.SphereGeometry(1.2, 6, 6), pos: [0, 0, 0] },
        { geo: new THREE.SphereGeometry(0.85, 6, 6), pos: [-0.9, -0.2, 0.2] },
        { geo: new THREE.SphereGeometry(0.8, 6, 6), pos: [0.9, -0.25, -0.15] },
        { geo: new THREE.SphereGeometry(0.65, 5, 5), pos: [-0.3, 0.6, -0.1] }
      ];

      parts.forEach(p => {
        const mesh = new THREE.Mesh(p.geo, cloudMat);
        mesh.position.set(...p.pos);
        mesh.castShadow = true;
        cloud.add(mesh);
      });

      cloud.position.set(x, y, z);
      // Random scaling for natural look
      const scale = 0.8 + Math.random() * 0.5;
      cloud.scale.set(scale, scale, scale);

      cloudGroup.add(cloud);
      clouds.push({
        mesh: cloud,
        speed: 0.015 + Math.random() * 0.01,
        baseZ: z
      });
    };

    // Place clouds
    for (let i = 0; i < 15; i++) {
      const cx = (Math.random() - 0.5) * 28;
      const cy = 4.5 + Math.random() * 4.5;
      const cz = 15 - Math.random() * 80;
      createCartoonCloud(cx, cy, cz);
    }

    // 8. The Aeroplane
    const aeroplane = new THREE.Group();
    
    // Fuselage (Body)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6, flatShading: true }); // Orange
    const bodyGeo = new THREE.CylinderGeometry(0.48, 0.38, 2.2, 8);
    const fuselage = new THREE.Mesh(bodyGeo, bodyMat);
    fuselage.rotation.x = Math.PI / 2; // Lie along Z
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    aeroplane.add(fuselage);

    // Nose Cone
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6, flatShading: true }); // Yellow
    const noseGeo = new THREE.ConeGeometry(0.38, 0.6, 8);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 1.3;
    nose.rotation.x = Math.PI / 2;
    nose.castShadow = true;
    aeroplane.add(nose);

    // Propeller Hub (Red spinner spinner)
    const propHubMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const propHub = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), propHubMat);
    propHub.position.z = 1.62;
    aeroplane.add(propHub);

    // Propeller Blades (Group to rotate)
    const propellerBladesGroup = new THREE.Group();
    propellerBladesGroup.position.z = 1.66;
    aeroplane.add(propellerBladesGroup);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
    const bladeGeo = new THREE.BoxGeometry(0.04, 1.2, 0.12);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    propellerBladesGroup.add(blade);

    // Cockpit Canopy (Blue windshield)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8, roughness: 0.1 });
    const canopyGeo = new THREE.BoxGeometry(0.28, 0.28, 0.5);
    const cockpit = new THREE.Mesh(canopyGeo, canopyMat);
    cockpit.position.set(0, 0.4, 0.2);
    cockpit.castShadow = true;
    aeroplane.add(cockpit);

    // Wings
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 }); // Yellow wings
    const wingGeo = new THREE.BoxGeometry(3.6, 0.08, 0.65);
    const mainWings = new THREE.Mesh(wingGeo, wingMat);
    mainWings.position.set(0, 0.05, 0.2);
    mainWings.castShadow = true;
    aeroplane.add(mainWings);

    // Tail Stabilizers
    const tailWingGeo = new THREE.BoxGeometry(1.2, 0.05, 0.32);
    const tailWings = new THREE.Mesh(tailWingGeo, wingMat);
    tailWings.position.set(0, 0.05, -0.85);
    tailWings.castShadow = true;
    aeroplane.add(tailWings);

    // Vertical Tail Fin
    const tailFinGeo = new THREE.BoxGeometry(0.05, 0.65, 0.4);
    const tailFin = new THREE.Mesh(tailFinGeo, bodyMat);
    tailFin.position.set(0, 0.36, -0.85);
    tailFin.castShadow = true;
    aeroplane.add(tailFin);

    // Small cartoon wheel details
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db });
    const wheelPositions = [
      { x: -0.5, y: -0.6, z: 0.4 },
      { x: 0.5, y: -0.6, z: 0.4 }
    ];
    wheelPositions.forEach(wp => {
      // Strut
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), strutMat);
      strut.position.set(wp.x, wp.y + 0.2, wp.z);
      strut.rotation.z = wp.x > 0 ? -0.2 : 0.2;
      strut.castShadow = true;
      aeroplane.add(strut);

      // Wheel
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8), tireMat);
      wheel.position.set(wp.x, wp.y, wp.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      aeroplane.add(wheel);
    });

    aeroplane.position.set(-2, 0.5, 5);
    scene.add(aeroplane);

    // 9. Landmarks for States
    const landmarkGroup = new THREE.Group();
    scene.add(landmarkGroup);

    // A. BIHAR LANDMARK (Z = 0)
    const biharGroup = new THREE.Group();
    biharGroup.position.set(-5, -4, 0);

    // School House Building (Cartoon School)
    const schoolMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.8, flatShading: true }); // red walls
    const schoolBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.0, 2.5), schoolMat);
    schoolBase.position.y = 1.0;
    schoolBase.castShadow = true;
    schoolBase.receiveShadow = true;
    biharGroup.add(schoolBase);

    // Slanted Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8, flatShading: true }); // brown
    const schoolRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.2, 4), roofMat);
    schoolRoof.position.y = 2.6;
    schoolRoof.rotation.y = Math.PI / 4; // Align flat edges
    schoolRoof.castShadow = true;
    biharGroup.add(schoolRoof);

    // School Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.1), noseMat); // Yellow
    door.position.set(0, 0.65, 1.26);
    biharGroup.add(door);

    // School Sign Board
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.1), boardMat);
    signBoard.position.set(0, 1.6, 1.26);
    biharGroup.add(signBoard);

    // Bodhi/Mango Tree (Large cartoon tree)
    const biharTree = new THREE.Group();
    const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 3.5, 6), trunkMat);
    treeTrunk.position.y = 1.75;
    treeTrunk.castShadow = true;
    biharTree.add(treeTrunk);

    // Massive fluffy canopy out of grouped spheres
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9, flatShading: true });
    const canopyCenter = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), foliageMat);
    canopyCenter.position.set(0, 3.8, 0);
    canopyCenter.castShadow = true;
    biharTree.add(canopyCenter);

    const canopyL = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 6), foliageMat);
    canopyL.position.set(-1.2, 3.4, 0.4);
    canopyL.castShadow = true;
    biharTree.add(canopyL);

    const canopyR = new THREE.Mesh(new THREE.SphereGeometry(1.3, 6, 6), foliageMat);
    canopyR.position.set(1.1, 3.5, -0.3);
    canopyR.castShadow = true;
    biharTree.add(canopyR);

    biharTree.position.set(-3.2, 0, -1.8);
    biharGroup.add(biharTree);

    // Signpost
    const postMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const signpostB = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), postMat);
    post.position.y = 0.9;
    post.castShadow = true;
    signpostB.add(post);

    const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 0.15), roofMat);
    board.position.set(0, 1.5, 0);
    board.rotation.y = 0.4;
    board.castShadow = true;
    signpostB.add(board);
    signpostB.position.set(2.2, 0, 1.2);
    biharGroup.add(signpostB);

    landmarkGroup.add(biharGroup);


    // B. PUNJAB LANDMARK (Z = -25)
    const punjabGroup = new THREE.Group();
    punjabGroup.position.set(5, -4, -25);

    // College Building
    const collegeMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8, flatShading: true }); // white walls
    const collegeBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.0, 3.0), collegeMat);
    collegeBase.position.y = 1.5;
    collegeBase.castShadow = true;
    collegeBase.receiveShadow = true;
    punjabGroup.add(collegeBase);

    // College Columns (Pillars in front)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.8 });
    for (let px = -1.6; px <= 1.6; px += 0.8) {
      if (Math.abs(px) > 0.1) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6), pillarMat);
        pillar.position.set(px, 1.3, 1.65);
        pillar.castShadow = true;
        punjabGroup.add(pillar);
      }
    }
    // Pillars Roof pediment
    const pediment = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 0.8), bodyMat); // Orange accent
    pediment.position.set(0, 2.8, 1.4);
    pediment.castShadow = true;
    punjabGroup.add(pediment);

    // Stack of Giant Textbooks
    const bookGroup = new THREE.Group();
    
    // Bottom Book (Blue)
    const book1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.8), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 }));
    book1.position.y = 0.225;
    book1.rotation.y = 0.1;
    book1.castShadow = true;
    bookGroup.add(book1);

    // Middle Book (Red)
    const book2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.6), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.7 }));
    book2.position.y = 0.65;
    book2.rotation.y = -0.15;
    book2.castShadow = true;
    bookGroup.add(book2);

    // Top Book (Yellow)
    const book3 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 }));
    book3.position.y = 1.025;
    book3.rotation.y = 0.05;
    book3.castShadow = true;
    bookGroup.add(book3);

    // Floating Graduation Cap
    const gradCap = new THREE.Group();
    // Cap board
    const capBoard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 1.1), tireMat);
    capBoard.position.y = 1.6;
    capBoard.castShadow = true;
    gradCap.add(capBoard);
    // Skull cap base
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.35, 8), tireMat);
    capBase.position.y = 1.4;
    capBase.castShadow = true;
    gradCap.add(capBase);
    
    bookGroup.add(gradCap);
    bookGroup.position.set(-3.5, 0, 1.0);
    punjabGroup.add(bookGroup);

    // Wheat crop patches (yellow cylinders representing fields)
    const wheatMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    for (let wx = -4; wx <= -2; wx += 0.8) {
      for (let wz = -2; wz <= 0; wz += 0.8) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.8 + Math.random()*0.4), wheatMat);
        stalk.position.set(wx, 0.4, wz);
        stalk.castShadow = true;
        punjabGroup.add(stalk);
      }
    }

    landmarkGroup.add(punjabGroup);


    // C. KARNATAKA LANDMARK - Nielsen Internship & Bengaluru Tech (Z = -50)
    const karnatakaGroup = new THREE.Group();
    karnatakaGroup.position.set(-5, -4, -50);

    // Nielsen Corporate Tech Tower (Skyscraper style)
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, flatShading: true }); // dark blue
    const techTower = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.5, 3.6), towerMat);
    techTower.position.y = 3.75;
    techTower.castShadow = true;
    techTower.receiveShadow = true;
    karnatakaGroup.add(techTower);

    // Nielsen Cyan highlights
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
    const trimBeam = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.4, 3.7), trimMat);
    trimBeam.position.y = 7.1;
    karnatakaGroup.add(trimBeam);

    // Neon logo letter "N" (Nielsen) built out of boxes
    const nielsenN = new THREE.Group();
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), trimMat);
    l1.position.set(-0.35, 0, 0);
    l1.castShadow = true;
    nielsenN.add(l1);
    const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), trimMat);
    l2.position.set(0.35, 0, 0);
    l2.castShadow = true;
    nielsenN.add(l2);
    const diagonal = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.2), trimMat);
    diagonal.position.set(0, 0, 0);
    diagonal.rotation.z = -0.6; // Angle
    diagonal.castShadow = true;
    nielsenN.add(diagonal);
    nielsenN.position.set(0, 5.8, 1.9); // Center front of tower
    karnatakaGroup.add(nielsenN);

    // Glowy Window boxes
    const windowMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbae6fd, roughness: 0.1 });
    for (let wy = 1.0; wy <= 6.5; wy += 1.2) {
      for (let wx = -1.1; wx <= 1.1; wx += 1.1) {
        if (Math.abs(wx) > 0.1) {
          const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.1), windowMat);
          windowMesh.position.set(wx, wy, 1.82);
          karnatakaGroup.add(windowMesh);
        }
      }
    }

    // Floating Code Icons in the sky
    const codeGroup = new THREE.Group();
    codeGroup.position.set(3.2, 4.0, 0);

    // Bracket 1: <
    const braceMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.4 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), braceMat);
    b1.position.set(-0.25, 0.25, 0);
    b1.rotation.z = 0.6;
    b1.castShadow = true;
    codeGroup.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), braceMat);
    b2.position.set(-0.25, -0.25, 0);
    b2.rotation.z = -0.6;
    b2.castShadow = true;
    codeGroup.add(b2);

    // Slash: /
    const slash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.12), braceMat);
    slash.position.set(0.1, 0, 0);
    slash.rotation.z = -0.3;
    slash.castShadow = true;
    codeGroup.add(slash);

    // Bracket 2: >
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), braceMat);
    b3.position.set(0.45, 0.25, 0);
    b3.rotation.z = -0.6;
    b3.castShadow = true;
    codeGroup.add(b3);

    const b4 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), braceMat);
    b4.position.set(0.45, -0.25, 0);
    b4.rotation.z = 0.6;
    b4.castShadow = true;
    codeGroup.add(b4);

    karnatakaGroup.add(codeGroup);
    landmarkGroup.add(karnatakaGroup);


    // 10. Star Particles
    const starGroup = new THREE.Group();
    scene.add(starGroup);
    const stars = [];
    const starGeo = new THREE.SphereGeometry(0.2, 4, 4);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // glowing yellow
    for (let i = 0; i < 40; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(
        (Math.random() - 0.5) * 45,
        5 + Math.random() * 8,
        -Math.random() * 80
      );
      starGroup.add(star);
      stars.push(star);
    }

    // 11. Physics/Autopilot variables
    const clock = new THREE.Clock();

    // 12. Frame Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Spin Propeller
      propellerBladesGroup.rotation.z += 0.25;

      // Animate Grad Cap Floating
      gradCap.position.y = Math.sin(time * 2.5) * 0.12;
      gradCap.rotation.y += 0.015;

      // Animate Code brackets floating & spinning
      codeGroup.position.y = 4.0 + Math.sin(time * 2) * 0.25;
      codeGroup.rotation.y = Math.sin(time * 0.5) * 0.3;

      // Drift Clouds slowly
      clouds.forEach(cloud => {
        cloud.mesh.position.z += cloud.speed;
        // Wrap cloud
        if (cloud.mesh.position.z > 22) {
          cloud.mesh.position.z = -75;
          cloud.mesh.position.x = (Math.random() - 0.5) * 28;
        }
      });

      // Gently twinkle stars
      stars.forEach((star, idx) => {
        star.scale.setScalar(0.7 + Math.sin(time * 3 + idx) * 0.3);
      });

      // Coordinate Aeroplane position
      // Read directly from Ref to prevent rendering restarts on scroll
      const targetZ = scrollProgressRef.current * -50.0 + 5.0; // Starts at Z=5, ends at Z=-45
      
      // X maps to activeStation (Bihar: -2.5, Punjab: 2.5, Karnataka: -2.5)
      let targetX = -2.5;
      if (activeStationRef.current === 'punjab') {
        targetX = 2.5;
      }

      // Smooth interpolation (lerp)
      aeroplane.position.z += (targetZ - aeroplane.position.z) * 0.06;
      aeroplane.position.x += (targetX - aeroplane.position.x) * 0.05;

      // Idle Hover animation
      const hoverOffset = Math.sin(time * 3.5) * 0.15;
      aeroplane.position.y = 0.5 + hoverOffset;

      // Wiggle/Roll rotation
      const hoverWiggleRoll = Math.sin(time * 3) * 0.03;
      const hoverWigglePitch = Math.cos(time * 3.5) * 0.015;
      
      // Bank/Roll leaning when changing lanes (lateral speed derivative)
      const xDiff = targetX - aeroplane.position.x;
      const bankingRoll = xDiff * 0.15;
      const bankingYaw = xDiff * 0.12;

      aeroplane.rotation.z = bankingRoll + hoverWiggleRoll;
      aeroplane.rotation.y = -bankingYaw; // Yaw steer
      aeroplane.rotation.x = hoverWigglePitch;

      // Cinematic camera follow
      // Positioned slightly offset behind the plane
      const targetCamX = aeroplane.position.x + 3.8;
      const targetCamY = aeroplane.position.y + 2.2;
      const targetCamZ = aeroplane.position.z + 7.5;

      camera.position.x += (targetCamX - camera.position.x) * 0.06;
      camera.position.y += (targetCamY - camera.position.y) * 0.06;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;

      // Point camera slightly in front of the aeroplane
      camera.lookAt(
        aeroplane.position.x - 0.5,
        aeroplane.position.y - 0.4,
        aeroplane.position.z - 2.5
      );

      renderer.render(scene, camera);
    };

    animate();

    // 13. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup WebGL resources when component actually unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse(object => {
        if (!object.isMesh) return;
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      });
    };
  }, []); // Run ONCE on component mount to prevent recreation loop on scroll!

  return (
    <div ref={mountRef} className="canvas-container">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
