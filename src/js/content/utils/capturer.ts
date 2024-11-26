/**
 * @module cropper
 */

interface MouseEventHandler {
  (event: MouseEvent): void;
}

interface KeyboardEventHandler {
  (event: KeyboardEvent): void;
}

const COMPONENT_NAME = 'x-qrcode-capturer';

class AbortError extends Error {
  public override readonly name = 'AbortError';

  constructor(message: string = 'Aborted') {
    super(message);
  }
}

let promise: Promise<DOMRectReadOnly> | null = null;

const crosshair = chrome.runtime.getURL('images/crosshair.cur');

const CSS = `
.${COMPONENT_NAME}-backdrop,
.${COMPONENT_NAME}-selection {
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  border: none;
  position: fixed;
  overflow: hidden;
  box-sizing: border-box;
  cursor: url(${crosshair}) 16 16, crosshair;
}

.${COMPONENT_NAME}-backdrop {
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  background: transparent;
}

.${COMPONENT_NAME}-selection {
  width: 0;
  height: 0;
  z-index: 2147483647;
  will-change: background-position;
  animation: marching-ants 1s linear infinite;
  background-position: 0 0, 0 100%, 0 0, 100% 0;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.45);
  background-image:
    linear-gradient(to right, #fff 50%, #000 50%),
    linear-gradient(to right, #fff 50%, #000 50%),
    linear-gradient(to bottom, #fff 50%, #000 50%),
    linear-gradient(to bottom, #fff 50%, #000 50%);
  background-size: 10px 1px, 10px 1px, 1px 10px, 1px 10px;
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
}

@keyframes marching-ants {
  0% {
    background-position: 0 0, 0 100%, 0 0, 100% 0;
  }

  100% {
    background-position: 20px 0, -20px 100%, 0 -20px, 100% 20px;
  }
}
`;

export function selectCaptureArea(): Promise<DOMRect> {
  if (promise === null) {
    promise = new Promise<DOMRect>((resolve, reject) => {
      let startX = 0;
      let startY = 0;
      let capturing = false;

      const { documentElement } = document;

      const style = document.createElement('style');
      const backdrop = document.createElement('div');
      const selection = document.createElement('div');
      const stage = document.createElement(COMPONENT_NAME);

      const shadowRoot = stage.attachShadow({ mode: 'closed' });

      backdrop.classList.add(`${COMPONENT_NAME}-backdrop`);

      selection.classList.add(`${COMPONENT_NAME}-selection`);

      const escape: KeyboardEventHandler = event => {
        if (!capturing && event.key === 'Escape') {
          event.preventDefault();

          cleanup();

          reject(new AbortError('aborted with escape'));
        }
      };

      const contextmenu: MouseEventHandler = event => {
        event.preventDefault();
      };

      const mousedown: MouseEventHandler = event => {
        if (event.button === 0) {
          event.preventDefault();

          capturing = true;

          startX = event.clientX;
          startY = event.clientY;

          const { style } = selection;

          style.width = '0';
          style.height = '0';
          style.top = `${startY}px`;
          style.left = `${startX}px`;
        }
      };

      const mousemove: MouseEventHandler = event => {
        if (capturing) {
          event.preventDefault();

          const { style } = selection;
          const { clientWidth, clientHeight } = documentElement;

          const clientX = Math.max(0, Math.min(clientWidth, event.clientX));
          const clientY = Math.max(0, Math.min(clientHeight, event.clientY));

          const top = Math.min(startY, clientY);
          const left = Math.min(startX, clientX);
          const width = Math.abs(clientX - startX);
          const height = Math.abs(clientY - startY);

          style.top = `${top}px`;
          style.left = `${left}px`;
          style.width = `${width}px`;
          style.height = `${height}px`;
        }
      };

      const mouseup: MouseEventHandler = event => {
        if (event.button === 0) {
          event.preventDefault();

          const rect = selection.getBoundingClientRect();

          cleanup();

          resolve(rect);
        }
      };

      const cleanup = () => {
        promise = null;
        capturing = false;

        window.removeEventListener('keyup', escape, true);
        window.removeEventListener('contextmenu', contextmenu, true);
        window.removeEventListener('mousedown', mousedown, true);
        window.removeEventListener('mousemove', mousemove, true);
        window.removeEventListener('mouseup', mouseup, true);

        stage.remove();
      };

      window.addEventListener('keyup', escape, true);
      window.addEventListener('contextmenu', contextmenu, true);
      window.addEventListener('mousedown', mousedown, true);
      window.addEventListener('mousemove', mousemove, true);
      window.addEventListener('mouseup', mouseup, true);

      style.append(CSS);

      shadowRoot.append(style, backdrop, selection);

      document.body.append(stage);
    });
  }

  return promise;
}
