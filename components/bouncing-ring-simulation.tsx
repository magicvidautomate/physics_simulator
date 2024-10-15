'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";

// Define physics presets
const physicsPresets = {
  normal: { gravity: 0.2, speedIncrease: 0.5, maxSpeed: 20 },
  lowGravity: { gravity: 0.05, speedIncrease: 0.3, maxSpeed: 15 },
  highBounce: { gravity: 0.3, speedIncrease: 0.8, maxSpeed: 25 },
  chaotic: { gravity: 0.4, speedIncrease: 1, maxSpeed: 30 },
};

export function BouncingRingSimulation() {
  const canvasRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 4, y: 0 });
  const audioContextRef = useRef(null);
  const [bounceCount, setBounceCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [clearProgress, setClearProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [traceColor, setTraceColor] = useState('#00ff00');
  const [soundType, setSoundType] = useState('sine');
  const [soundFrequency, setSoundFrequency] = useState(220);
  const [bgColor1, setBgColor1] = useState('#4a0e4e');
  const [bgColor2, setBgColor2] = useState('#81236b');
  const [bgColor3, setBgColor3] = useState('#2c699a');
  const [physicsPreset, setPhysicsPreset] = useState('normal');
  const [ringRadius, setRingRadius] = useState(35);

  // Constants
  const BORDER_RADIUS = 350;
  const INITIAL_SPEED = 4;
  const COLLISION_MARGIN = 2;

  // Use the selected physics preset
  const { gravity, speedIncrease, maxSpeed } = physicsPresets[physicsPreset];

  const initAudioContext = () => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  };

  const playBounceSound = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = soundType;
    oscillator.frequency.setValueAtTime(soundFrequency, audioContextRef.current.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  const resetSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    positionRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2 - (BORDER_RADIUS - ringRadius - COLLISION_MARGIN)
    };
    velocityRef.current = { x: INITIAL_SPEED, y: 0 };
    setBounceCount(0);
    setSpeed(INITIAL_SPEED);
    setClearProgress(0);
    setIsComplete(false);
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawColorfulBackground(ctx);
  };

  const drawColorfulBackground = (ctx) => {
    const canvas = canvasRef.current;
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, BORDER_RADIUS
    );
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(0.5, bgColor2);
    gradient.addColorStop(1, bgColor3);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, BORDER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    resetSimulation();

    const calculateClearedArea = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let clearedPixels = 0;
      let totalPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const dx = x - canvas.width / 2;
        const dy = y - canvas.height / 2;
        if (dx * dx + dy * dy <= BORDER_RADIUS * BORDER_RADIUS) {
          totalPixels++;
          if (data[i + 3] === 0) {
            clearedPixels++;
          }
        }
      }

      return clearedPixels / totalPixels;
    };

    const animate = () => {
      if (!isRunning || isComplete) return;

      // Apply gravity from the current physics preset
      velocityRef.current.y += gravity;

      // Update position
      positionRef.current.x += velocityRef.current.x;
      positionRef.current.y += velocityRef.current.y;

      // Clear the ring's previous position (constrained to circle)
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, BORDER_RADIUS, 0, 2 * Math.PI);
      ctx.clip();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(positionRef.current.x, positionRef.current.y, ringRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = 'source-over';

      // Draw border
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, BORDER_RADIUS, 0, 2 * Math.PI);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw bouncing ring
      ctx.beginPath();
      ctx.arc(positionRef.current.x, positionRef.current.y, ringRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Check for collision
      const dx = positionRef.current.x - canvas.width / 2;
      const dy = positionRef.current.y - canvas.height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance + ringRadius + COLLISION_MARGIN > BORDER_RADIUS) {
        // Play bounce sound
        playBounceSound();

        // Calculate new velocity after bounce
        const normal = { x: dx / distance, y: dy / distance };
        const dotProduct = velocityRef.current.x * normal.x + velocityRef.current.y * normal.y;
        const newVelocity = {
          x: velocityRef.current.x - 2 * dotProduct * normal.x,
          y: velocityRef.current.y - 2 * dotProduct * normal.y
        };

        // Increase speed using the current physics preset
        const currentSpeed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
        const increasedSpeed = Math.min(currentSpeed + speedIncrease, maxSpeed);
        const scaleFactor = increasedSpeed / currentSpeed;

        velocityRef.current = {
          x: newVelocity.x * scaleFactor,
          y: newVelocity.y * scaleFactor
        };

        setBounceCount(prev => prev + 1);
        setSpeed(increasedSpeed);
      }

      // Calculate and update clear progress
      const progress = calculateClearedArea();
      setClearProgress(progress);

      if (progress >= 0.99) {
        setIsComplete(true);
        setIsRunning(false);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isRunning && !isComplete) {
      animate();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, isComplete, traceColor, soundType, soundFrequency, bgColor1, bgColor2, bgColor3, physicsPreset, ringRadius]);

  const toggleSimulation = () => {
    if (!audioContextRef.current) {
      initAudioContext();
    }
    if (isRunning || isComplete) {
      resetSimulation();
    }
    setIsRunning(!isRunning);
  };

  const handleColorChange = (event) => {
    setTraceColor(event.target.value);
  };

  const handleSoundTypeChange = (value) => {
    setSoundType(value);
  };

  const handleFrequencyChange = (event) => {
    setSoundFrequency(Number(event.target.value));
  };

  const handleBgColorChange = (index, event) => {
    const color = event.target.value;
    if (index === 1) setBgColor1(color);
    else if (index === 2) setBgColor2(color);
    else if (index === 3) setBgColor3(color);
  };

  const handlePhysicsPresetChange = (value) => {
    setPhysicsPreset(value);
    resetSimulation();
  };

  const handleRingSizeChange = (value: number) => {
    setRingRadius(value);
    resetSimulation();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col md:flex-row items-start justify-center w-full max-w-7xl gap-8">
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={BORDER_RADIUS * 2 + 20}
            height={BORDER_RADIUS * 2 + 20}
            className="mb-4"
          />
          <Button onClick={toggleSimulation} className="mb-4">
            {isComplete ? 'Restart' : isRunning ? 'Reset' : 'Start'} Simulation
          </Button>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color-picker" className="mr-2">Trace Color:</Label>
              <Input
                id="color-picker"
                type="color"
                value={traceColor}
                onChange={handleColorChange}
                className="w-12 h-8"
              />
            </div>
            <div>
              <Label htmlFor="sound-type" className="mr-2">Sound Type:</Label>
              <Select value={soundType} onValueChange={handleSoundTypeChange}>
                <SelectTrigger id="sound-type" className="w-32">
                  <SelectValue placeholder="Select sound type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sine">Sine</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="sawtooth">Sawtooth</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency" className="mr-2">Frequency (Hz):</Label>
              <Input
                id="frequency"
                type="number"
                value={soundFrequency}
                onChange={handleFrequencyChange}
                min={20}
                max={2000}
                className="w-20"
              />
            </div>
            <div>
              <Label htmlFor="physics-preset" className="mr-2">Physics Preset:</Label>
              <Select value={physicsPreset} onValueChange={handlePhysicsPresetChange}>
                <SelectTrigger id="physics-preset" className="w-32">
                  <SelectValue placeholder="Select physics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lowGravity">Low Gravity</SelectItem>
                  <SelectItem value="highBounce">High Bounce</SelectItem>
                  <SelectItem value="chaotic">Chaotic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bg-color-1" className="mr-2">BG Color 1:</Label>
              <Input
                id="bg-color-1"
                type="color"
                value={bgColor1}
                onChange={(e) => handleBgColorChange(1, e)}
                className="w-12 h-8"
              />
            </div>
            <div>
              <Label htmlFor="bg-color-2" className="mr-2">BG Color 2:</Label>
              <Input
                id="bg-color-2"
                type="color"
                value={bgColor2}
                onChange={(e) => handleBgColorChange(2, e)}
                className="w-12 h-8"
              />
            </div>
            <div>
              <Label htmlFor="bg-color-3" className="mr-2">BG Color 3:</Label>
              <Input
                id="bg-color-3"
                type="color"
                value={bgColor3}
                onChange={(e) => handleBgColorChange(3, e)}
                className="w-12 h-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ring-size" className="mr-2">Ring Size:</Label>
            <Slider
              id="ring-size"
              min={10}
              max={100}
              step={1}
              value={ringRadius}
              onChange={handleRingSizeChange}
              className="w-48"
            />
            <span className="ml-2">{ringRadius}px</span>
          </div>
          <div className="text-left bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Simulation Stats</h3>
            <p>Ring radius: {ringRadius} px</p>
            <p>Border radius: {BORDER_RADIUS} px</p>
            <p>Initial ring speed: {INITIAL_SPEED} px/frame</p>
            <p>Current speed: {speed.toFixed(2)} px/frame</p>
            <p>Bounce count: {bounceCount}</p>
            <p>Clear progress: {(clearProgress * 100).toFixed(2)}%</p>
            <p>Current physics: {physicsPreset}</p>
            <p>Gravity: {gravity}</p>
            <p>Speed increase: {speedIncrease}</p>
            <p>Max speed: {maxSpeed}</p>
            {isComplete && <p className="text-green-500 font-bold">Simulation Complete!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}