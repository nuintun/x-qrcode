/**
 * @module App
 */

import { ActionType } from '/js/common/action';
import { memo, useEffect, useState } from 'react';
import { Alert, ConfigProvider, Spin } from 'antd';

interface EncodeOk {
  type: 'ok';
  payload: string;
}

interface EncodeError {
  type: 'error';
  message: string;
}

interface ResultProps {
  value?: EncodeOk | EncodeError;
}

const Result = memo(function Result({ value }: ResultProps) {
  if (value) {
    switch (value.type) {
      case 'ok':
        return <img src={value.payload} style={{ display: 'block' }} />;
      case 'error':
        return <Alert type="error" message={value.message} showIcon style={{ whiteSpace: 'nowrap' }} />;
      default:
        return <Alert type="error" message="发生未知错误" showIcon />;
    }
  }

  return null;
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<EncodeOk | EncodeError>();

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
        payload: string;
      }

      const message = await runtime.sendMessage<Message, EncodeOk | EncodeError>({
        action: ActionType.ENCODE_TAB_LINK,
        payload: content
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
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 0
        }
      }}
    >
      <Spin size="small" delay={100} spinning={loading}>
        <div style={{ minWidth: '100vw', minHeight: '100vh' }}>
          <Result value={state} />
        </div>
      </Spin>
    </ConfigProvider>
  );
}
