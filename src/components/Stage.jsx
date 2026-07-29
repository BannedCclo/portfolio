import { useEffect, useRef } from "react";
import { initStage, startStage } from "../three/stage.js";

/**
 * The single fixed WebGL canvas the whole page draws into (see
 * src/three/stage.js for why one canvas serves every section). Rendered once,
 * near the top of <App>, and never unmounted for the life of the page — acts
 * register against the shared scene from their own section components
 * regardless of mount order, so this only needs to attach the canvas and
 * start the render loop.
 */
export default function Stage() {
  const mountRef = useRef(null);

  useEffect(() => {
    initStage(mountRef.current);
    startStage();
    // no cleanup: the stage is a page-wide singleton that outlives this
    // component's own mount/unmount cycle (see stage.js's idempotency guards)
  }, []);

  return (
    <>
      <div id="stage" ref={mountRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
