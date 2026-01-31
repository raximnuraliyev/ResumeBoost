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
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.6} />
          <spotLight
            position={[5, 8, 5]}
            angle={0.2}
            penumbra={1}
            intensity={1.5}
            castShadow
          />
          <pointLight position={[-5, -5, -5]} intensity={0.4} color="#6366f1" />
          <pointLight position={[5, -3, 3]} intensity={0.4} color="#f59e0b" />
          <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />
          
          <Model url="/rocket.glb" />
          
          <Environment preset="night" />
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
