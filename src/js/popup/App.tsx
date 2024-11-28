/**
 * @module App
 */

import { Alert, Spin } from 'antd';
import { ActionType } from '/js/common/action';
import { memo, useEffect, useState } from 'react';
import { EncodeResult, Options } from '/js/common/encode';

interface ResultProps {
  value?: EncodeResult;
}

const Result = memo(function Result({ value }: ResultProps) {
  if (value) {
    switch (value.type) {
      case 'ok':
        return <img src={value.payload} style={{ display: 'block' }} />;
      case 'error':
        return <Alert type="error" message={value.message} showIcon />;
      default:
        return <Alert type="error" message="发生未知错误" showIcon />;
    }
  }

  return null;
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<EncodeResult>();

  useEffect(() => {
    const { runtime } = chrome;

    const encode = async () => {
      setLoading(true);

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      const { url: content = '' } = tab;

      interface Message {
        action: string;
        payload: Options & {
          content: string;
        };
      }

      const message = await runtime.sendMessage<Message, EncodeResult>({
        action: ActionType.ENCODE_TAB_LINK,
        payload: {
          content,
          level: 'H',
          fnc1: 'None',
          mode: 'Auto',
          quietZone: 8,
          moduleSize: 2,
          aimIndicator: 0,
          version: 'Auto',
          charset: 'UTF_8',
          background: '#ffffff',
          foreground: '#000000'
        }
      });

      setState(message);
      setLoading(false);
    };

    encode();

    const contextmenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', contextmenu, true);

    return () => {
      document.removeEventListener('contextmenu', contextmenu, true);
    };
  }, []);

  return (
    <Spin spinning={loading} delay={120} style={{ minHeight: 37 }}>
      <Result value={state} />
    </Spin>
  );
}
