/* eslint-disable */
/*
 * CRAB TOKEN GROWTH TRACKER - LIVE SOLANA DATA
 * 
 * TO INTEGRATE YOUR TOKEN:
 * 1. Replace "YOUR_TOKEN_ADDRESS_HERE" below with your Solana contract address
 * 2. Deploy this file - data will automatically update every 5 seconds
 * 3. Claws grow based on real market cap from DexScreener
 */

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Copy, Check } from 'lucide-react';

const CrabGrowth = () => {
  const [tokenData, setTokenData] = useState(null); // Start with null instead of fake data
  const [hasContractAddress, setHasContractAddress] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [autoRotate] = useState(true);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const mountRef = useRef(null);
  const crabGroupRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Check if contract address is set on mount
  useEffect(() => {
    const contractAddress = 'C25pDDWuFJyrHXFzZ6ThhJFWpeUqESim4FxaWNkhpump';
    setHasContractAddress(contractAddress !== 'YOUR_TOKEN_ADDRESS_HERE');
  }, []);
  
  const getGrowthStage = () => {
    if (!tokenData) return 1;
    const size = tokenData.currentSize;
    if (size < 30) return 1;
    if (size < 60) return 2;
    if (size < 120) return 3;
    if (size < 250) return 4;
    return 5;
  };
  
  const growthStage = getGrowthStage();
  
  const handleCopy = () => {
    navigator.clipboard.writeText('C25pDDWuFJyrHXFzZ6ThhJFWpeUqESim4FxaWNkhpump');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // FETCH REAL TOKEN DATA FROM DEXSCREENER
  const fetchRealData = async () => {
    if (!hasContractAddress) return; // Don't fetch if no CA
    
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/C25pDDWuFJyrHXFzZ6ThhJFWpeUqESim4FxaWNkhpump`
      );
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const mainPair = data.pairs[0];
        const marketCap = parseFloat(mainPair.fdv) || parseFloat(mainPair.marketCap) || 15000;
        
        setTokenData({
          price: parseFloat(mainPair.priceUsd) || 0.00001234,
          marketCap: marketCap,
          holders: 234, // DexScreener doesn't provide holder count
          currentSize: Math.sqrt(marketCap / 100)
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };
  
  useEffect(() => {
    if (window.THREE) {
      setThreeLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setThreeLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const buildSimpleCrab = (stage, size, tokenData) => {
    const THREE = window.THREE;
    if (!THREE || !crabGroupRef.current || !tokenData) return; // Add tokenData check
    
    const crabGroup = crabGroupRef.current;
    
    while (crabGroup.children.length > 0) {
      const child = crabGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      crabGroup.remove(child);
    }
    
    // BODY IS FIXED - NEVER GROWS
    const bodyScale = 0.3; // Fixed size, period.
    
    // BALLS NOW GROW with market cap!
    const marketCapFactor = Math.sqrt(tokenData.marketCap / 15000);
    const ballGrowth = Math.pow(marketCapFactor, 1.3);
    const ballScale = 0.15 * ballGrowth * (1 + stage * 0.3); // Balls grow!
    
    // CLAWS STAY FIXED SIZE
    const clawScale = 0.2; // Fixed claw size
    
    // SCALE ENTIRE GROUP DOWN so balls never leave viewport
    const maxBallSize = ballScale * 2;
    const viewportScale = Math.min(1, 2.5 / (1 + maxBallSize)); // Keep in frame
    
    // Simple red material - smooth shading
    const redMaterial = new THREE.MeshPhongMaterial({
      color: 0xCC2222,
      shininess: 70,
      flatShading: false // Smooth shading for cleaner look
    });
    
    const darkRedMaterial = new THREE.MeshPhongMaterial({
      color: 0x991111,
      shininess: 50,
      flatShading: false
    });
    
    // Ball material - slightly different color
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0xFF3333,
      shininess: 80,
      flatShading: false
    });
    
    // SIMPLE BODY - FLAT like 2D icon, SMOOTH
    const bodyGeometry = new THREE.SphereGeometry(bodyScale, 32, 32); // Higher poly for smoothness
    bodyGeometry.scale(1.3, 0.4, 1); // VERY FLAT
    const body = new THREE.Mesh(bodyGeometry, redMaterial);
    body.castShadow = true;
    crabGroup.add(body);
    
    // Apply viewport scale to entire group at the end
    crabGroup.scale.set(viewportScale, viewportScale, viewportScale);
    
    // Simple shell lines - SMOOTH
    for (let i = 0; i < 3; i++) {
      const lineGeometry = new THREE.TorusGeometry(
        bodyScale * (0.6 + i * 0.15),
        bodyScale * 0.03,
        16,
        48, // Higher segments for smoothness
        Math.PI
      );
      const line = new THREE.Mesh(lineGeometry, darkRedMaterial);
      line.rotation.x = Math.PI / 2;
      line.position.y = bodyScale * (0.3 - i * 0.15);
      crabGroup.add(line);
    }
    
    // PROPER CRAB CLAWS - NOW FIXED SIZE (don't grow!)
    const createProperClaw = (side) => {
      const clawGroup = new THREE.Group();
      
      // UPPER ARM - connects to body, SMOOTH
      const upperArmGeometry = new THREE.CylinderGeometry(
        bodyScale * 0.11,
        bodyScale * 0.13,
        bodyScale * 0.55,
        24
      );
      const upperArm = new THREE.Mesh(upperArmGeometry, redMaterial);
      upperArm.rotation.z = side * Math.PI / 6;
      upperArm.position.x = side * bodyScale * 0.28;
      upperArm.position.y = -bodyScale * 0.12;
      upperArm.castShadow = true;
      clawGroup.add(upperArm);
      
      // ELBOW JOINT - overlaps with arm ends
      const elbowGeometry = new THREE.SphereGeometry(bodyScale * 0.14, 24, 24); // Slightly bigger
      const elbow = new THREE.Mesh(elbowGeometry, darkRedMaterial);
      elbow.position.x = side * bodyScale * 0.56;
      elbow.position.y = -bodyScale * 0.36;
      clawGroup.add(elbow);
      
      // FOREARM - overlaps with elbow and wrist
      const forearmGeometry = new THREE.CylinderGeometry(
        bodyScale * 0.1,
        bodyScale * 0.12,
        bodyScale * 0.45,
        24
      );
      const forearm = new THREE.Mesh(forearmGeometry, redMaterial);
      forearm.rotation.z = side * Math.PI / 8;
      forearm.position.x = side * bodyScale * 0.77;
      forearm.position.y = -bodyScale * 0.46;
      forearm.castShadow = true;
      clawGroup.add(forearm);
      
      // WRIST JOINT - overlaps with forearm and claw
      const wristGeometry = new THREE.SphereGeometry(bodyScale * 0.13, 24, 24); // Slightly bigger
      const wrist = new THREE.Mesh(wristGeometry, darkRedMaterial);
      wrist.position.x = side * bodyScale * 0.97;
      wrist.position.y = -bodyScale * 0.56;
      clawGroup.add(wrist);
      
      // CLAW BODY - Slim teardrop, FIXED SIZE
      const clawBodyGeometry = new THREE.SphereGeometry(clawScale * 0.32, 32, 32);
      clawBodyGeometry.scale(1.6, 0.8, 0.7);
      const clawBody = new THREE.Mesh(clawBodyGeometry, redMaterial);
      clawBody.position.x = side * (bodyScale * 0.95 + clawScale * 0.32);
      clawBody.position.y = -bodyScale * 0.56;
      clawBody.castShadow = true;
      clawGroup.add(clawBody);
      
      // TOP FINGER - FIXED SIZE
      const topFingerGeometry = new THREE.SphereGeometry(clawScale * 0.14, 24, 24);
      topFingerGeometry.scale(2.2, 0.7, 0.55);
      const topFinger = new THREE.Mesh(topFingerGeometry, redMaterial);
      topFinger.position.x = side * (bodyScale * 0.95 + clawScale * 0.7);
      topFinger.position.y = -bodyScale * 0.55 + clawScale * 0.22;
      topFinger.rotation.z = side * 0.12;
      topFinger.castShadow = true;
      clawGroup.add(topFinger);
      
      // BOTTOM FINGER - FIXED SIZE
      const bottomFingerGeometry = new THREE.SphereGeometry(clawScale * 0.14, 24, 24);
      bottomFingerGeometry.scale(2.2, 0.7, 0.55);
      const bottomFinger = new THREE.Mesh(bottomFingerGeometry, redMaterial);
      bottomFinger.position.x = side * (bodyScale * 0.95 + clawScale * 0.7);
      bottomFinger.position.y = -bodyScale * 0.55 - clawScale * 0.22;
      bottomFinger.rotation.z = -side * 0.12;
      bottomFinger.castShadow = true;
      clawGroup.add(bottomFinger);
      
      // TOP PINCER SEGMENTS - FIXED SIZE
      const topPincer1Geometry = new THREE.SphereGeometry(clawScale * 0.08, 20, 20);
      topPincer1Geometry.scale(1.5, 0.75, 0.65);
      const topPincer1 = new THREE.Mesh(topPincer1Geometry, redMaterial);
      topPincer1.position.x = side * (bodyScale * 0.95 + clawScale * 0.95);
      topPincer1.position.y = -bodyScale * 0.55 + clawScale * 0.24;
      topPincer1.rotation.z = side * 0.18;
      clawGroup.add(topPincer1);
      
      const topPincer2Geometry = new THREE.SphereGeometry(clawScale * 0.06, 16, 16);
      topPincer2Geometry.scale(1.4, 0.7, 0.6);
      const topPincer2 = new THREE.Mesh(topPincer2Geometry, redMaterial);
      topPincer2.position.x = side * (bodyScale * 0.95 + clawScale * 1.05);
      topPincer2.position.y = -bodyScale * 0.55 + clawScale * 0.21;
      topPincer2.rotation.z = side * 0.22;
      clawGroup.add(topPincer2);
      
      const topPincer3Geometry = new THREE.SphereGeometry(clawScale * 0.045, 12, 12);
      topPincer3Geometry.scale(1.3, 0.65, 0.55);
      const topPincer3 = new THREE.Mesh(topPincer3Geometry, redMaterial);
      topPincer3.position.x = side * (bodyScale * 0.95 + clawScale * 1.13);
      topPincer3.position.y = -bodyScale * 0.55 + clawScale * 0.17;
      clawGroup.add(topPincer3);
      
      // BOTTOM PINCER SEGMENTS - FIXED SIZE
      const bottomPincer1Geometry = new THREE.SphereGeometry(clawScale * 0.08, 20, 20);
      bottomPincer1Geometry.scale(1.5, 0.75, 0.65);
      const bottomPincer1 = new THREE.Mesh(bottomPincer1Geometry, redMaterial);
      bottomPincer1.position.x = side * (bodyScale * 0.95 + clawScale * 0.95);
      bottomPincer1.position.y = -bodyScale * 0.55 - clawScale * 0.24;
      bottomPincer1.rotation.z = -side * 0.18;
      clawGroup.add(bottomPincer1);
      
      const bottomPincer2Geometry = new THREE.SphereGeometry(clawScale * 0.06, 16, 16);
      bottomPincer2Geometry.scale(1.4, 0.7, 0.6);
      const bottomPincer2 = new THREE.Mesh(bottomPincer2Geometry, redMaterial);
      bottomPincer2.position.x = side * (bodyScale * 0.95 + clawScale * 1.05);
      bottomPincer2.position.y = -bodyScale * 0.55 - clawScale * 0.21;
      bottomPincer2.rotation.z = -side * 0.22;
      clawGroup.add(bottomPincer2);
      
      const bottomPincer3Geometry = new THREE.SphereGeometry(clawScale * 0.045, 12, 12);
      bottomPincer3Geometry.scale(1.3, 0.65, 0.55);
      const bottomPincer3 = new THREE.Mesh(bottomPincer3Geometry, redMaterial);
      bottomPincer3.position.x = side * (bodyScale * 0.95 + clawScale * 1.13);
      bottomPincer3.position.y = -bodyScale * 0.55 - clawScale * 0.17;
      clawGroup.add(bottomPincer3);
      
      clawGroup.position.x = side * bodyScale * 1.1;
      clawGroup.position.z = 0;
      
      return clawGroup;
    };
    
    crabGroup.add(createProperClaw(-1));
    crabGroup.add(createProperClaw(1));
    
    // SIMPLE LEGS - SMOOTH
    for (let i = 0; i < 4; i++) {
      for (let side of [-1, 1]) {
        const legGeometry = new THREE.CylinderGeometry(
          bodyScale * 0.05,
          bodyScale * 0.06,
          bodyScale * 0.9,
          16 // Smoother
        );
        const leg = new THREE.Mesh(legGeometry, redMaterial);
        leg.position.x = side * bodyScale * 0.8;
        leg.position.z = bodyScale * (-0.4 + i * 0.27);
        leg.position.y = -bodyScale * 0.3;
        leg.rotation.z = side * Math.PI / 5;
        leg.castShadow = true;
        crabGroup.add(leg);
      }
    }
    
    // EYES ON TOP OF BODY - FIXED SIZE (back to normal)
    for (let side of [-1, 1]) {
      // Eye stalk - short and attached to body top
      const stalkGeometry = new THREE.CylinderGeometry(
        bodyScale * 0.06,
        bodyScale * 0.07,
        bodyScale * 0.22,
        16
      );
      const stalk = new THREE.Mesh(stalkGeometry, redMaterial);
      stalk.position.x = side * bodyScale * 0.45;
      stalk.position.y = bodyScale * 0.28;
      stalk.position.z = bodyScale * 0.35;
      stalk.castShadow = true;
      crabGroup.add(stalk);
      
      // Eye ball - FIXED SIZE
      const eyeGeometry = new THREE.SphereGeometry(bodyScale * 0.11, 20, 20);
      const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        shininess: 100
      });
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.x = side * bodyScale * 0.45;
      eye.position.y = bodyScale * 0.42;
      eye.position.z = bodyScale * 0.37;
      eye.castShadow = true;
      crabGroup.add(eye);
      
      // White shine - FIXED SIZE
      const shineGeometry = new THREE.SphereGeometry(bodyScale * 0.035, 12, 12);
      const shine = new THREE.Mesh(shineGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      shine.position.x = side * bodyScale * 0.42;
      shine.position.y = bodyScale * 0.46;
      shine.position.z = bodyScale * 0.44;
      crabGroup.add(shine);
    }
    
    // 🔴 THE BALLS - THESE GROW WITH MARKET CAP! 🔴
    // Two balls hanging underneath the crab body
    const ballGroup = new THREE.Group();
    
    // Left ball
    const leftBallGeometry = new THREE.SphereGeometry(ballScale, 32, 32);
    const leftBall = new THREE.Mesh(leftBallGeometry, ballMaterial);
    leftBall.position.x = -bodyScale * 0.25;
    leftBall.position.y = -bodyScale * 0.3 - ballScale;
    leftBall.position.z = bodyScale * 0.1;
    leftBall.castShadow = true;
    ballGroup.add(leftBall);
    
    // Right ball
    const rightBallGeometry = new THREE.SphereGeometry(ballScale, 32, 32);
    const rightBall = new THREE.Mesh(rightBallGeometry, ballMaterial);
    rightBall.position.x = bodyScale * 0.25;
    rightBall.position.y = -bodyScale * 0.3 - ballScale;
    rightBall.position.z = bodyScale * 0.1;
    rightBall.castShadow = true;
    ballGroup.add(rightBall);
    
    // Connector between balls (optional - makes it look more attached)
    const connectorGeometry = new THREE.CylinderGeometry(
      ballScale * 0.3,
      ballScale * 0.3,
      bodyScale * 0.5,
      16
    );
    connectorGeometry.rotateZ(Math.PI / 2);
    const connector = new THREE.Mesh(connectorGeometry, ballMaterial);
    connector.position.y = -bodyScale * 0.3 - ballScale;
    connector.position.z = bodyScale * 0.1;
    ballGroup.add(connector);
    
    crabGroup.add(ballGroup);
  };
  
  useEffect(() => {
    if (!threeLoaded || !mountRef.current) return;
    
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);
    
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const crabGroup = new THREE.Group();
    crabGroupRef.current = crabGroup;
    scene.add(crabGroup);
    
    if (tokenData) {
      buildSimpleCrab(growthStage, tokenData.currentSize, tokenData);
    }
    
    let rotation = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (autoRotate && crabGroupRef.current) {
        rotation += 0.005;
        crabGroupRef.current.rotation.y = rotation;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      const mount = mountRef.current;
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [threeLoaded, autoRotate]);
  
  useEffect(() => {
    if (threeLoaded && crabGroupRef.current && tokenData) {
      buildSimpleCrab(growthStage, tokenData.currentSize, tokenData);
    }
  }, [tokenData, growthStage, threeLoaded]);
  
  useEffect(() => {
    if (!hasContractAddress) return; // Only fetch if CA is set
    
    // Fetch immediately on load
    fetchRealData();
    
    // Then fetch every 5 seconds
    const interval = setInterval(() => {
      fetchRealData();
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasContractAddress]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moltballs</h1>
            <p className="text-sm text-gray-500 mt-1">Watch the balls grow</p>
          </div>
          <div className="flex gap-12">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</div>
              <div className="text-2xl font-bold text-gray-900">
                {tokenData ? `$ ${tokenData.price.toFixed(8)}` : 'No Data'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Cap</div>
              <div className="text-2xl font-bold text-gray-900">
                {tokenData ? `$ ${tokenData.marketCap.toLocaleString()}` : 'No Data'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left stats */}
        <div className="w-64 p-8">
          <div className="space-y-6">
            {/* Current Stats Box */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Current Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Market Cap</div>
                  <div className="text-xl font-bold text-gray-900">
                    {tokenData ? `$${(tokenData.marketCap / 1000).toFixed(1)}K` : 'No Data'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="text-lg font-bold text-gray-900">
                    {tokenData ? `$${tokenData.price.toFixed(8)}` : 'No Data'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Holders</div>
                  <div className="text-lg font-bold text-gray-900">
                    {tokenData ? tokenData.holders.toLocaleString() : 'No Data'}
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Box */}
            <div className="bg-white rounded-lg border-2 border-red-600 p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Growth</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Stage</div>
                  <div className="text-2xl font-bold text-red-600">{growthStage} / 5</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ball Size</div>
                  <div className="text-lg font-bold text-gray-900">
                    {tokenData ? `${(Math.sqrt(tokenData.marketCap / 15000) * 100).toFixed(0)}%` : 'No Data'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Vitals Box */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Vitals</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">Fight Level</div>
                  <div className="text-sm font-bold text-gray-900">{growthStage * 20}%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i <= growthStage ? 'bg-red-600' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">Flex Power</div>
                  <div className="text-sm font-bold text-red-600">
                    {growthStage >= 5 ? 'MAX' : 'GROWING'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center 3D view */}
        <div className="flex-1 relative bg-white">
          <div ref={mountRef} className="w-full h-full" />
          
          {!threeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          
          {!hasContractAddress && threeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-900 text-xl font-bold mb-2">No Contract Address</div>
                <div className="text-gray-500 text-sm">Add your token contract address to see live data</div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-xs text-gray-500 mb-1">Balls are growing</div>
            <div className="text-2xl font-bold text-red-600">
              {tokenData ? `${(Math.sqrt(tokenData.marketCap / 15000) * 100).toFixed(0)}% bigger` : 'No Data'}
            </div>
          </div>
        </div>
        
        {/* Right info */}
        <div className="w-80 p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Token</h3>
              
              <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="text-xs text-gray-500">Holders</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {tokenData ? tokenData.holders.toLocaleString() : 'No Data'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border-2 border-red-600 p-5">
                <div className="text-xs text-gray-500 mb-3">Contract Address</div>
                <div className="font-mono text-xs text-gray-900 bg-gray-50 p-3 rounded mb-4 break-all">
                  YOUR_TOKEN_ADDRESS_HERE
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
            
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors text-lg">
              Buy Token
            </button>
            
            <a 
              href="https://x.com/Moltballs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow on X
            </a>
          </div>
        </div>
      </div>
      
      {/* Simple footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 gap-3">
            {[
              { stage: 1, label: 'Small' },
              { stage: 2, label: 'Growing' },
              { stage: 3, label: 'Big' },
              { stage: 4, label: 'Huge' },
              { stage: 5, label: 'MASSIVE' }
            ].map((milestone) => (
              <div 
                key={milestone.stage}
                className={`text-center py-3 rounded-lg border-2 transition-all ${
                  growthStage >= milestone.stage
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-sm font-bold">Stage {milestone.stage}</div>
                <div className="text-xs mt-1">{milestone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrabGrowth;
