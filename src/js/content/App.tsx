/**
 * @module App
 */

import { ActionType } from '/js/common/action';
import { selectCaptureArea } from '/js/common/capturer';
import { App as AntdApp, ConfigProvider, Image } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

const { useApp } = AntdApp;

const Page = memo(function Page() {
  const { message } = useApp();
  const [url, setURL] = useState<string>();
  const [visible, setVisible] = useState(false);

  const onVisibleChange = useCallback((visible: boolean) => {
    if (!visible) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    let capturing = false;

    const { runtime } = chrome;

    const capture = async () => {
      if (!capturing) {
        capturing = true;

        const rect = await selectCaptureArea();

        if (rect !== null) {
          const unloading = message.loading('解码中...');

          interface Message {
            action: string;
            rect: DOMRectReadOnly;
          }

          const response = await runtime.sendMessage<Message, any>({
            action: ActionType.DECODE_SELECT_CAPTURE_AREA,
            rect
          });

          if (response) {
            if (response.type === 'ok') {
              setVisible(true);
              setURL(response.payload.image);

              console.log(response.payload.decoded);
            } else {
              message.error(response.message);
            }
          }

          unloading();
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

  return <Image key={url} src={url} width={0} preview={{ visible, onVisibleChange }} />;
});

export default memo(function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const getContainer = useCallback(() => rootRef.current!, []);

  return (
    <div ref={rootRef} style={{ position: 'fixed', zIndex: 2147483647 }}>
      <ConfigProvider getPopupContainer={getContainer} getTargetContainer={getContainer}>
        <AntdApp component={false} message={{ maxCount: 3 }}>
          <Page />
        </AntdApp>
      </ConfigProvider>
    </div>
  );
});
