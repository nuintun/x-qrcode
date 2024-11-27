import { Alert, Spin } from 'antd';
import { memo, useEffect, useState } from 'react';
import { EncodeMessage, EncodeResultMessage } from '/js/workers/encode';

interface ResultProps {
  value?: EncodeResultMessage;
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
  const [state, setState] = useState<EncodeResultMessage>();

  useEffect(() => {
    const worker = new Worker(new URL('/js/workers/encode.ts', import.meta.url));

    worker.addEventListener('message', ({ data }: MessageEvent<EncodeResultMessage>) => {
      setState(data);
      setLoading(false);
    });

    const execute = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      const { url: content = '' } = tab;

      worker.postMessage({
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
      } satisfies EncodeMessage);
    };

    execute();

    const contextmenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', contextmenu, true);

    return () => {
      worker.terminate();

      document.removeEventListener('contextmenu', contextmenu, true);
    };
  }, []);

  return (
    <Spin spinning={loading} delay={120} style={{ minHeight: 37 }}>
      <Result value={state} />
    </Spin>
  );
}
