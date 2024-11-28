/**
 * @module App
 */

import { ConfigProvider, Image } from 'antd';
import { ActionType } from '/js/common/action';
import { selectCaptureArea } from '/js/common/capturer';
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

    const capture = async () => {
      if (!capturing) {
        capturing = true;

        try {
          const rect = await selectCaptureArea();

          if (rect.width > 0 && rect.height > 0) {
            interface Message {
              type: string;
              rect: DOMRectReadOnly;
            }

            const message = await runtime.sendMessage<Message, any>({
              type: ActionType.DECODE_SELECT_CAPTURE_AREA,
              rect
            });

            if (message?.type === 'ok') {
              setVisible(true);
              setURL(message.payload.image);

              console.log(message.payload.items);
            } else {
              console.log(message.message);
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error(error);
          }
        }

        capturing = false;
      }
    };

    const onMessage = (message: any) => {
      switch (message.type) {
        case 'capture':
          capture();
          break;
        case 'capturedArea':
          setURL(message.url);
          setVisible(true);
          break;
        case ActionType.DECODE_SELECT_IMAGE:
          console.log(message);
          break;
        default:
          break;
      }
    };

    runtime.onMessage.addListener(onMessage);

    return () => {
      runtime.onMessage.removeListener(onMessage);
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
