'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (modelRef.current) {
      // Subtle floating animation
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.15
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <primitive 
        ref={modelRef}
        object={scene} 
        scale={2.0}
        position={[0, -0.2, 0]}
      />
    </Float>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  )
}

interface MascotViewerProps {
  className?: string
}

export function MascotViewer({ className = '' }: MascotViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [1.8, 0.8, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Enhanced lighting for brighter, clearer appearance */}
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={2.5}
            color="#ffffff"
            castShadow
          />
          <spotLight
            position={[5, 8, 5]}
            angle={0.3}
            penumbra={0.5}
            intensity={3}
            color="#ffffff"
            castShadow
          />
          <spotLight
            position={[-5, 8, -5]}
            angle={0.3}
            penumbra={0.5}
            intensity={2}
            color="#a5b4fc"
          />
          <pointLight position={[-5, -5, -5]} intensity={1} color="#818cf8" />
          <pointLight position={[5, -3, 3]} intensity={1} color="#fbbf24" />
          <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, -2, 5]} intensity={0.6} color="#c4b5fd" />
          
          <Model url="/rocket.glb" />
          
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload('/rocket.glb')
