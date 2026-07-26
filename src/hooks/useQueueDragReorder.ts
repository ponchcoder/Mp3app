/**
 * Pointer-based queue drag reorder — works on touch and mouse.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface QueueDragGhost {
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
  width: number;
}

/**
 * Where a row should visually sit while dragging.
 * Matches splice(from,1) + splice(to,0,item) preview semantics.
 */
export function getItemVisualIndex(
  index: number,
  from: number,
  to: number
): number {
  if (index === from) return to;

  if (from < to) {
    if (index > from && index <= to) return index - 1;
  } else if (from > to) {
    if (index >= to && index < from) return index + 1;
  }

  return index;
}

/** Gap always appears at the destination index. */
export function getGapVisualIndex(to: number): number {
  return to;
}

export function useQueueDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void,
  disabled: boolean,
  listRef: React.RefObject<HTMLElement | null>,
  itemCount: number
) {
  const dragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const metricsRef = useRef({ rowHeight: 56, listTop: 0, scrollTop: 0 });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [ghost, setGhost] = useState<QueueDragGhost | null>(null);
  const [rowHeight, setRowHeight] = useState(56);

  const measureList = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const row = list.querySelector("[data-queue-row]");
    if (row instanceof HTMLElement) {
      const height = row.offsetHeight;
      metricsRef.current.rowHeight = height;
      setRowHeight(height);
    }

    const scrollParent = list.closest("[data-queue-scroll]");
    metricsRef.current.listTop = list.getBoundingClientRect().top;
    metricsRef.current.scrollTop =
      scrollParent instanceof HTMLElement ? scrollParent.scrollTop : 0;
  }, [listRef]);

  const findDropIndex = useCallback(
    (clientX: number, clientY: number): number => {
      if (itemCount <= 0) return 0;

      const list = listRef.current;
      if (list) {
        // Fixed slot hit targets stay put while rows animate — avoids
        // upward drags fighting rows that slide under the finger.
        const slotEl = document
          .elementFromPoint(clientX, clientY)
          ?.closest("[data-queue-drop-slot]");

        if (slotEl instanceof HTMLElement) {
          const slot = Number(slotEl.dataset.queueDropSlot);
          if (!Number.isNaN(slot)) {
            return Math.max(0, Math.min(itemCount - 1, slot));
          }
        }

        const scrollParent = list.closest("[data-queue-scroll]");
        const scrollTop =
          scrollParent instanceof HTMLElement ? scrollParent.scrollTop : 0;
        const listTop = list.getBoundingClientRect().top;
        const { rowHeight: h } = metricsRef.current;
        const relativeY = clientY - listTop + scrollTop;
        return Math.max(
          0,
          Math.min(itemCount - 1, Math.floor(relativeY / h))
        );
      }

      return overIndexRef.current ?? dragIndexRef.current ?? 0;
    },
    [listRef, itemCount]
  );

  const finishDrag = useCallback(
    (clientX?: number, clientY?: number) => {
      const from = dragIndexRef.current;
      dragIndexRef.current = null;

      const to =
        clientX !== undefined && clientY !== undefined
          ? findDropIndex(clientX, clientY)
          : overIndexRef.current;

      setDragIndex(null);
      setOverIndex(null);
      setGhost(null);
      overIndexRef.current = null;
      document.body.style.overflow = "";

      if (from !== null && to !== null && from !== to) {
        onReorder(from, to);
      }
    },
    [findDropIndex, onReorder]
  );

  const startDrag = useCallback(
    (index: number, e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      measureList();

      const row = e.currentTarget.closest("[data-queue-row]") as HTMLElement | null;
      const rect = row?.getBoundingClientRect();

      dragIndexRef.current = index;
      overIndexRef.current = index;
      setDragIndex(index);
      setOverIndex(index);

      if (rect) {
        setGhost({
          pointerX: e.clientX,
          pointerY: e.clientY,
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
          width: rect.width,
        });
      }

      document.body.style.overflow = "hidden";
    },
    [disabled, measureList]
  );

  useEffect(() => {
    if (disabled || dragIndex === null) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const idx = findDropIndex(e.clientX, e.clientY);
      overIndexRef.current = idx;
      setOverIndex(idx);
      setGhost((prev) =>
        prev
          ? { ...prev, pointerX: e.clientX, pointerY: e.clientY }
          : null
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      finishDrag(e.clientX, e.clientY);
    };

    const onPointerCancel = () => {
      finishDrag();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      document.body.style.overflow = "";
    };
  }, [disabled, dragIndex, findDropIndex, finishDrag]);

  return { dragIndex, overIndex, ghost, rowHeight, startDrag };
}
