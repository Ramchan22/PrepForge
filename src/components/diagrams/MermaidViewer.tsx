'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Copy, Check, Code, Eye } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  id?: string;
}

export function MermaidViewer({ chart, id = 'mermaid-chart' }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSource, setShowSource] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090e1a',
        primaryColor: '#6366f1',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#4f46e5',
        lineColor: '#818cf8',
        secondaryColor: '#10b981',
        tertiaryColor: '#0f172a',
        mainBkg: '#0d1527',
        nodeBorder: '#4338ca',
        textColor: '#e2e8f0',
        fontSize: '13px',
      },
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      try {
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        setSvgContent(svg);
      } catch (err) {
        console.error('[Mermaid Rendering Error]', err);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  const handleCopySource = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative rounded-xl border border-slate-800 bg-[#090e1a] overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'w-full my-6'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Architecture Flow Diagram</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-800 mx-1"></div>

          {/* Toggle source / visual */}
          <button
            onClick={() => setShowSource(!showSource)}
            className={`p-1.5 rounded-md transition-colors flex items-center space-x-1 text-xs ${
              showSource ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="View Mermaid Source"
          >
            {showSource ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showSource ? 'Diagram' : 'Source'}</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopySource}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div
        ref={containerRef}
        className={`overflow-auto p-6 flex items-center justify-center min-h-[300px] bg-[#070b14] ${
          isFullscreen ? 'flex-1' : 'max-h-[550px]'
        }`}
      >
        {showSource ? (
          <pre className="w-full text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800">
            {chart}
          </pre>
        ) : (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="flex items-center justify-center max-w-full"
          />
        )}
      </div>
    </div>
  );
}
