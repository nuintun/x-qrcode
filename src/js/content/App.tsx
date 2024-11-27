import { ConfigProvider, Image } from 'antd';
import { selectCaptureArea } from './utils/capturer';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function App() {
  const [url, setURL] = useState<string>();
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const getContainer = useCallback(() => {
    return rootRef.current!;
  }, []);

  useEffect(() => {
    let capturing = false;

    const { runtime } = chrome;

    const selectArea = async () => {
      capturing = true;

      try {
        const rect = await selectCaptureArea();

        if (rect.width > 0 && rect.height > 0) {
          interface Message {
            type: 'selectedArea';
            rect: DOMRectReadOnly;
          }

          const url = await runtime.sendMessage<Message, string | undefined>({
            type: 'selectedArea',
            rect
          });

          setURL(url);
          setVisible(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error(error);
        }
      }

      capturing = false;
    };

    const onMessage = (message: any) => {
      switch (message.type) {
        case 'capture':
          selectArea();
          break;
        case 'capturedArea':
          setURL(message.url);
          setVisible(true);
          break;
      }
    };

    const onCapture = async (event: KeyboardEvent) => {
      if (!capturing && event.altKey && event.ctrlKey && /^a$/i.test(event.key)) {
        event.preventDefault();

        selectArea();
      }
    };

    runtime.onMessage.addListener(onMessage);

    window.addEventListener('keyup', onCapture, true);

    return () => {
      runtime.onMessage.removeListener(onMessage);

      window.removeEventListener('keyup', onCapture, true);
    };
  }, []);

  return (
    <ConfigProvider getPopupContainer={getContainer} getTargetContainer={getContainer}>
      <div ref={rootRef} style={{ position: 'fixed', zIndex: 2147483647 }}>
        <Image
          key={url}
          src={url}
          width={0}
          preview={{
            visible: visible,
            onVisibleChange(visible) {
              if (!visible) {
                setVisible(false);
              }
            }
          }}
        />
      </div>
    </ConfigProvider>
  );
}
