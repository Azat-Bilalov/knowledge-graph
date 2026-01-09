/**
 * Graph Viewer Component
 *
 * Displays rendered SVG graph with pan/zoom support and fullscreen mode.
 */

import { useRef, useState, useCallback, useEffect } from "react";

interface GraphViewerProps {
  svg: string;
  className?: string;
}

export function GraphViewer({ svg, className = "" }: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevSvgRef = useRef<string>("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(Math.max(0.1, prev * delta), 5));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Fit graph to container and center it
  const fitToView = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    const svgElement = content.querySelector("svg");

    if (!svgElement) return;

    // Get natural SVG size from attributes
    let svgWidth = parseFloat(svgElement.getAttribute("width") || "0");
    let svgHeight = parseFloat(svgElement.getAttribute("height") || "0");

    // If width/height are in pt, convert to px (1pt ≈ 1.33px)
    const widthAttr = svgElement.getAttribute("width") || "";
    const heightAttr = svgElement.getAttribute("height") || "";
    if (widthAttr.includes("pt")) {
      svgWidth = parseFloat(widthAttr) * 1.33;
    }
    if (heightAttr.includes("pt")) {
      svgHeight = parseFloat(heightAttr) * 1.33;
    }

    if (svgWidth === 0 || svgHeight === 0) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate scale to fit with some padding
    const padding = 60;
    const scaleX = (containerRect.width - padding) / svgWidth;
    const scaleY = (containerRect.height - padding) / svgHeight;
    const newScale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

    // Calculate centered position
    const scaledWidth = svgWidth * newScale;
    const scaledHeight = svgHeight * newScale;
    const centerX = (containerRect.width - scaledWidth) / 2;
    const centerY = (containerRect.height - scaledHeight) / 2;

    setScale(newScale);
    setPosition({ x: centerX, y: centerY });
  }, []);

  // Reset to 100% and center
  const resetView = useCallback(() => {
    if (!containerRef.current || !contentRef.current) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const container = containerRef.current;
    const content = contentRef.current;
    const svgElement = content.querySelector("svg");

    if (!svgElement) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    // Get natural SVG size
    let svgWidth = parseFloat(svgElement.getAttribute("width") || "0");
    let svgHeight = parseFloat(svgElement.getAttribute("height") || "0");
    const widthAttr = svgElement.getAttribute("width") || "";
    const heightAttr = svgElement.getAttribute("height") || "";
    if (widthAttr.includes("pt")) {
      svgWidth = parseFloat(widthAttr) * 1.33;
    }
    if (heightAttr.includes("pt")) {
      svgHeight = parseFloat(heightAttr) * 1.33;
    }

    const containerRect = container.getBoundingClientRect();

    // Center at 100%
    const centerX = (containerRect.width - svgWidth) / 2;
    const centerY = (containerRect.height - svgHeight) / 2;

    setScale(1);
    setPosition({ x: centerX, y: centerY });
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Fit to view after fullscreen change
      setTimeout(fitToView, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [fitToView]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Fit to view only when SVG actually changes (new graph)
  useEffect(() => {
    if (svg && svg !== prevSvgRef.current) {
      prevSvgRef.current = svg;
      // Small delay to ensure SVG is rendered
      const timer = setTimeout(() => {
        fitToView();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [svg, fitToView]);

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full ${className} ${
        isFullscreen ? "bg-white" : ""
      }`}
    >
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 5))}
          className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] text-sm"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.1))}
          className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] text-sm"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={fitToView}
          className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] text-xs"
          title="Fit to view"
        >
          ⊡
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] text-xs"
          title="Reset (100%)"
        >
          1:1
        </button>
        <div className="w-px bg-[var(--color-border)] mx-1" />
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] text-sm"
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
        >
          {isFullscreen ? "⊗" : "⛶"}
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 z-10 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/80 px-2 py-1 rounded">
        {Math.round(scale * 100)}%
        {isFullscreen && (
          <span className="ml-2 text-[var(--color-primary)]">• Fullscreen</span>
        )}
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && (
        <div className="absolute top-2 left-2 z-10 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/80 px-2 py-1 rounded">
          Press Esc to exit
        </div>
      )}

      {/* Graph container - white background for light-themed graphs */}
      <div
        ref={containerRef}
        className="h-full overflow-hidden cursor-grab active:cursor-grabbing rounded-lg"
        style={{ backgroundColor: "#ffffff" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          className="graph-container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "top left",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
