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

        const rect = await selectCaptureArea();

        if (rect !== null) {
          interface Message {
            action: string;
            rect: DOMRectReadOnly;
          }

          const message = await runtime.sendMessage<Message, any>({
            action: ActionType.DECODE_SELECT_CAPTURE_AREA,
            rect
          });

          if (message?.type === 'ok') {
            setVisible(true);
            setURL(message.payload.image);

            console.log(message.payload.items);
          } else {
            console.log(message?.message);
          }
        }

        capturing = false;
      }
    };

    const onMessage = (message: any) => {
      switch (message.action) {
        case ActionType.ENCODE_SELECT_LINK:
        case ActionType.ENCODE_SELECTION_TEXT:
          console.log(message);
          break;
        case ActionType.DECODE_SELECT_IMAGE:
          console.log(message);
          break;
        case ActionType.DECODE_SELECT_CAPTURE_AREA:
          capture();
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
