import { ConfigProvider, Image } from 'antd';
import { selectCaptureArea } from './utils/capturer';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function App() {
  const [url, setURL] = useState<string>();
  const rootRef = useRef<HTMLDivElement>(null);

  const getContainer = useCallback(() => {
    return rootRef.current!;
  }, []);

  useEffect(() => {
    let capturing = false;

    const selectArea = async () => {
      capturing = true;

      try {
        const rect = await selectCaptureArea();

        if (rect.width > 0 && rect.height > 0) {
          chrome.runtime.sendMessage({
            type: 'selectedArea',
            rect
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.error(error);
        }
      }

      capturing = false;
    };

    const onMessage = async (message: any) => {
      switch (message.type) {
        case 'capture':
          selectArea();
          break;
        case 'capturedArea':
          setURL(message.url);
          break;
      }
    };

    const onCapture = async (event: KeyboardEvent) => {
      if (!capturing && event.altKey && event.ctrlKey && /^a$/i.test(event.key)) {
        event.preventDefault();

        selectArea();
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);

    window.addEventListener('keyup', onCapture, true);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      window.removeEventListener('keyup', onCapture, true);
    };
  }, []);

  return (
    <ConfigProvider getPopupContainer={getContainer} getTargetContainer={getContainer}>
      <div ref={rootRef} style={{ position: 'fixed', zIndex: 2147483647 }}>
        <Image
          width={0}
          src={url}
          preview={{
            visible: !!url,
            onVisibleChange(visible) {
              if (!visible) {
                setURL(undefined);
              }
            }
          }}
        />
      </div>
    </ConfigProvider>
  );
}
