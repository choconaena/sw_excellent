// src/hooks/useFitViewportRows.js
import { useLayoutEffect } from "react";

export function useFitViewportRows(containerRef, headerRef, toolbarRef) {
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const h = headerRef.current?.offsetHeight || 0;
      const f = toolbarRef.current?.offsetHeight || 0;
      el.style.setProperty("--header-h", `${h}px`);
      el.style.setProperty("--footer-h", `${f}px`);
    };

    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);
    if (toolbarRef.current) ro.observe(toolbarRef.current);

    update();
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, headerRef, toolbarRef]);
}
