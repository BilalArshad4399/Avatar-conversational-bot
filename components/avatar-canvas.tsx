"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Box } from "@react-three/drei"
import type * as THREE from "three"

interface AvatarProps {
  emotion: string
  isSpeaking: boolean
  audioLevel: number
}

function Avatar({ emotion, isSpeaking, audioLevel }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const eyeLeftRef = useRef<THREE.Mesh>(null)
  const eyeRightRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Head movement
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05

      // Breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.setScalar(breathe)
    }

    // Blinking animation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 3) > 0.98 ? 0.1 : 1
      eyeLeftRef.current.scale.y = blink
      eyeRightRef.current.scale.y = blink
    }

    // Mouth movement when speaking
    if (mouthRef.current && isSpeaking) {
      const speak = Math.sin(state.clock.elapsedTime * 10) * 0.3 + 0.7
      mouthRef.current.scale.x = speak
      mouthRef.current.scale.y = speak
    }
  })

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "#FFD700"
      case "sad":
        return "#4169E1"
      case "excited":
        return "#FF4500"
      case "concerned":
        return "#DC143C"
      default:
        return "#32CD32"
    }
  }

  return (
    <group ref={meshRef}>
      {/* Head */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getEmotionColor()} />
      </Sphere>

      {/* Eyes */}
      <Sphere ref={eyeLeftRef} args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere ref={eyeRightRef} args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      {/* Mouth */}
      <Box ref={mouthRef} args={[0.3, 0.1, 0.1]} position={[0, -0.3, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Box>

      {/* Speaking indicator */}
      {isSpeaking && (
        <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color={getEmotionColor()} transparent opacity={0.2} />
        </Sphere>
      )}
    </group>
  )
}

export function AvatarCanvas({ emotion, isSpeaking, audioLevel }: AvatarProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Avatar emotion={emotion} isSpeaking={isSpeaking} audioLevel={audioLevel} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
