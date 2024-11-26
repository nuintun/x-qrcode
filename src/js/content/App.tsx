import { selectCaptureArea } from './utils/capturer';

let capturing = false;

const capture = (event: KeyboardEvent) => {
  if (!capturing && event.altKey && event.ctrlKey && /^a$/i.test(event.key)) {
    capturing = true;

    event.preventDefault();

    selectCaptureArea()
      .then(
        rect => {
          chrome.runtime.sendMessage({ type: 'capture', rect });
        },
        error => {
          console.error(error);
        }
      )
      .finally(() => {
        capturing = false;
      });
  }
};

window.addEventListener('keyup', capture, true);

export default function App() {
  return null;
}
