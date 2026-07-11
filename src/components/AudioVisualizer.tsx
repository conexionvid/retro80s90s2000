import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  playing: boolean;
  colorPrimary?: string;
  className?: string;
}

export function AudioVisualizer({ audioElement, playing, colorPrimary = "rgba(255, 255, 255, ", className = "w-full h-full" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    if (!audioElement || !canvasRef.current || initError) return;

    let audioCtx: AudioContext;
    try {
      if (!(window as any).sharedAudioCtx) {
        (window as any).sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      audioCtx = (window as any).sharedAudioCtx;
      
      if (audioCtx.state === 'suspended' && playing) {
          audioCtx.resume();
      }

      if (!(audioElement as any)._sharedAnalyser) {
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 2.0; // Boost volume significantly to counteract context volume drop
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; // Smaller size for smoother wider waves
        
        const source = audioCtx.createMediaElementSource(audioElement);
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        (audioElement as any)._sharedAnalyser = analyser;
      }
      
      analyserRef.current = (audioElement as any)._sharedAnalyser;
      if (!dataArrayRef.current) {
        dataArrayRef.current = new Uint8Array(analyserRef.current!.frequencyBinCount);
      }
    } catch (e) {
      console.error('AudioContext creation failed.', e);
      setInitError(true);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!playing) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const data = dataArrayRef.current;
      
      // Draw 2 overlapping misty waves for visual depth
      for (let w = 0; w < 2; w++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          
          let x = 0;
          // Use a subset of data points to create smooth flowing curves
          const dataPoints = 20; 
          const sliceWidth = canvas.width / (dataPoints - 1);
          
          for (let i = 0; i < dataPoints; i++) {
              // Map rendering points to frequency bins
              const dataIdx = Math.floor((i / dataPoints) * (bufferLength / 2.5)); 
              let v = data[dataIdx] / 255.0;
              
              if (w === 1) {
                 // Add an offset to out-of-phase the second wave slightly
                 v = data[Math.min(dataIdx + 2, bufferLength - 1)] / 255.0; 
              }
              
              // Apply easing to amplitudes and scale
              const heightMultiplier = w === 0 ? 0.9 : 0.6;
              const y = canvas.height - (v * canvas.height * heightMultiplier);
              
              // Render with bezier curves for that nebulous fluid look
              if (i === 0) {
                  ctx.lineTo(x, y);
              } else {
                  const prevDataIdx = Math.floor(((i - 1) / dataPoints) * (bufferLength / 2.5));
                  let prevV = data[prevDataIdx] / 255.0;
                  if (w === 1) prevV = data[Math.min(prevDataIdx + 2, bufferLength - 1)] / 255.0;
                  const prevY = canvas.height - (prevV * canvas.height * heightMultiplier);
                  const prevX = x - sliceWidth;
                  
                  const cpX1 = prevX + sliceWidth / 2;
                  const cpY1 = prevY;
                  const cpX2 = x - sliceWidth / 2;
                  const cpY2 = y;
                  
                  ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
              }
              x += sliceWidth;
          }
          
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          
          // Apply atmospheric gradients
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          const alphaStart = w === 0 ? "0.6" : "0.3";
          gradient.addColorStop(0, `${colorPrimary}${alphaStart})`);
          gradient.addColorStop(1, `${colorPrimary}0)`);
          
          ctx.fillStyle = gradient;
          ctx.fill();
      }
    };

    if (playing && !initError) {
       draw();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [audioElement, playing, initError, colorPrimary]);

  if (initError) {
    return (
        <div className="flex items-end gap-1 h-full w-full opacity-30">
            {playing && [1,2,3,4,5,6,7,8,9,10].map(i => (
                <div key={i} className="w-full bg-white/50 rounded-t flex-1" style={{
                    animation: `pulse 1.5s infinite alternate ease-in-out ${i * 0.1}s`,
                    height: '10%'
                }} />
            ))}
            <style>{`@keyframes pulse { 0% { height: 10%; } 100% { height: 80%; } }`}</style>
        </div>
    );
  }

  return <canvas ref={canvasRef} width={800} height={200} className={`block max-w-none ${className}`} style={{ width: '100%', height: '100%' }} />;
}
