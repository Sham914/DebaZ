import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { motion } from 'framer-motion';

Chart.register(...registerables);

interface EvidenceChartProps {
  proPoints: string[];
  conPoints: string[];
}

function extractNumber(s: string): number {
  const match = s.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : Math.random() * 80 + 20;
}

export default function EvidenceChart({ proPoints, conPoints }: EvidenceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = ['Metric 1', 'Metric 2', 'Metric 3'];
    const proData = proPoints.map(extractNumber);
    const conData = conPoints.map(extractNumber);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'ALEX (PRO)',
            data: proData,
            backgroundColor: 'rgba(255, 59, 79, 0.6)',
            borderColor: '#FF3B4F',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'SOPHIA (CON)',
            data: conData,
            backgroundColor: 'rgba(0, 212, 255, 0.6)',
            borderColor: '#00D4FF',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            labels: { color: '#fff', font: { family: 'Orbitron', size: 11 } },
          },
        },
        scales: {
          x: {
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [proPoints, conPoints]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-4 md:p-6 w-full max-w-2xl mx-auto"
      style={{ border: '1px solid rgba(255, 215, 0, 0.2)' }}
    >
      <p className="font-display text-arena-accent text-xs uppercase tracking-widest mb-3 text-center">
        Evidence Comparison
      </p>
      <div className="h-48 md:h-64">
        <canvas ref={chartRef} />
      </div>
    </motion.div>
  );
}
