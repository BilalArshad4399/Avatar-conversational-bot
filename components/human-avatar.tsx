"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Box, Cylinder } from "@react-three/drei"
import type * as THREE from "three"

interface HumanAvatarProps {
  emotion: string
  isSpeaking: boolean
  audioLevel: number
}

function HumanAvatar({ emotion, isSpeaking, audioLevel }: HumanAvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const eyeLeftRef = useRef<THREE.Mesh>(null)
  const eyeRightRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying motion
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }

    if (headRef.current) {
      // Head movement
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.05

      // Breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      headRef.current.scale.setScalar(breathe)
    }

    // Blinking animation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 3) > 0.98 ? 0.1 : 1
      eyeLeftRef.current.scale.y = blink
      eyeRightRef.current.scale.y = blink
    }

    // Mouth movement when speaking
    if (mouthRef.current && isSpeaking) {
      const speak = Math.sin(state.clock.elapsedTime * 15) * 0.3 + 0.7
      mouthRef.current.scale.x = speak
      mouthRef.current.scale.y = speak * 0.5
    }

    // Body breathing
    if (bodyRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.01
      bodyRef.current.scale.y = breathe
    }
  })

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "#FFB347" // Warm orange
      case "sad":
        return "#87CEEB" // Sky blue
      case "excited":
        return "#FF6B6B" // Coral red
      case "concerned":
        return "#DDA0DD" // Plum
      default:
        return "#F5DEB3" // Wheat (neutral skin tone)
    }
  }

  const getSkinColor = () => {
    return getEmotionColor()
  }

  return (
    <group ref={groupRef}>
      {/* Body */}
      <Cylinder ref={bodyRef} args={[0.6, 0.8, 2, 8]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#4A90E2" />
      </Cylinder>

      {/* Neck */}
      <Cylinder args={[0.3, 0.3, 0.4, 8]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Cylinder>

      {/* Head */}
      <Sphere ref={headRef} args={[0.8, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Sphere>

      {/* Hair */}
      <Sphere args={[0.85, 16, 16]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Sphere>

      {/* Eyes */}
      <group>
        {/* Eye whites */}
        <Sphere args={[0.15, 16, 16]} position={[-0.25, 0.6, 0.6]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.15, 16, 16]} position={[0.25, 0.6, 0.6]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>

        {/* Pupils */}
        <Sphere ref={eyeLeftRef} args={[0.08, 16, 16]} position={[-0.25, 0.6, 0.7]}>
          <meshStandardMaterial color="#000000" />
        </Sphere>
        <Sphere ref={eyeRightRef} args={[0.08, 16, 16]} position={[0.25, 0.6, 0.7]}>
          <meshStandardMaterial color="#000000" />
        </Sphere>
      </group>

      {/* Eyebrows */}
      <Box args={[0.2, 0.05, 0.1]} position={[-0.25, 0.75, 0.65]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.2, 0.05, 0.1]} position={[0.25, 0.75, 0.65]}>
        <meshStandardMaterial color="#654321" />
      </Box>

      {/* Nose */}
      <Box args={[0.1, 0.15, 0.1]} position={[0, 0.45, 0.7]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Box>

      {/* Mouth */}
      <Box ref={mouthRef} args={[0.25, 0.08, 0.05]} position={[0, 0.25, 0.75]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>

      {/* Arms */}
      <Cylinder args={[0.15, 0.15, 1.2, 8]} position={[-1, -0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 1.2, 8]} position={[1, -0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Cylinder>

      {/* Hands */}
      <Sphere args={[0.2, 16, 16]} position={[-1.5, -1.4, 0]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[1.5, -1.4, 0]}>
        <meshStandardMaterial color={getSkinColor()} />
      </Sphere>

      {/* Speaking indicator */}
      {isSpeaking && (
        <Sphere args={[1.5, 32, 32]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={getEmotionColor()} transparent opacity={0.1} />
        </Sphere>
      )}

      {/* Emotion aura */}
      {emotion !== "neutral" && (
        <Sphere args={[1.2, 32, 32]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={getEmotionColor()} transparent opacity={0.15} />
        </Sphere>
      )}
    </group>
  )
}

export function HumanAvatarCanvas({ emotion, isSpeaking, audioLevel }: HumanAvatarProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <HumanAvatar emotion={emotion} isSpeaking={isSpeaking} audioLevel={audioLevel} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
