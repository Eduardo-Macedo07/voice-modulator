import { useEffect, useRef } from "react";

interface Props {
  analyser: AnalyserNode | null;
}

const WIDTH = 720;
const HEIGHT = 240;

export function Visualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    g.fillStyle = "#12141a";
    g.fillRect(0, 0, WIDTH, HEIGHT);
    if (!analyser) return;

    const wave = new Uint8Array(analyser.fftSize);
    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(wave);
      analyser.getByteFrequencyData(spectrum);

      g.fillStyle = "#12141a";
      g.fillRect(0, 0, WIDTH, HEIGHT);

      // Spectrum: lower 1/4 of the bins covers the useful voice range.
      const bins = Math.floor(spectrum.length / 4);
      const barW = WIDTH / bins;
      g.fillStyle = "rgba(99, 102, 241, 0.55)";
      for (let i = 0; i < bins; i++) {
        const h = (spectrum[i] / 255) * HEIGHT;
        g.fillRect(i * barW, HEIGHT - h, Math.max(barW - 1, 1), h);
      }

      g.strokeStyle = "#34d399";
      g.lineWidth = 2;
      g.beginPath();
      for (let i = 0; i < wave.length; i++) {
        const x = (i / (wave.length - 1)) * WIDTH;
        const y = (wave[i] / 255) * HEIGHT;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="visualizer" />;
}
