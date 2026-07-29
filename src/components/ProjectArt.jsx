import { useEffect, useRef } from "react";
import { paintArtwork } from "../lib/artwork.js";

/**
 * Procedural placeholder artwork for a project card. Painted once on mount
 * from a seed derived from the project's own name/id — see lib/artwork.js
 * for why this reads as deliberate rather than a missing screenshot.
 */
export default function ProjectArt({ seed }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) paintArtwork(canvasRef.current, seed);
  }, [seed]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
