import React, { useCallback } from 'react';
import { Editor } from './Editor';
import { toMachine } from './StateChart';
import { notificationsActor } from './Header';

interface CodePanelProps {
  code: string;
  onChange: (code: string) => void;
  onSave: (code: string) => void;
}

export const CodePanel: React.FunctionComponent<CodePanelProps> = ({
  code,
  onChange,
  onSave
}) => {
  return <Editor code={code} onChange={onChange} onSave={onSave} />;
};
