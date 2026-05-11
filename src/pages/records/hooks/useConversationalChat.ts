import { useState, useCallback } from 'react';
import { parseChat, applyEditCommand } from './useChatParser';
import type { ChatRecord } from './useChatParser';
import type { HistoryEntry } from './useRecordHistory';

export type MessageRole = 'user' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  records?: ChatRecord[];
  feedback?: string;
  saved?: boolean;
}

let _msgId = 0;
function msgId() {
  return `msg_${Date.now()}_${++_msgId}`;
}

const GREETINGS = [
  'Olá! Pode me dizer o que quer lançar. Ex: "gastei 120 no mercado" ou "recebi 3000 de salário".',
  'Pronto para registrar. Pode digitar em linguagem natural!',
];

export function useConversationalChat(
  historyIndex: Record<string, HistoryEntry>,
  categories: any[],
) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: msgId(),
      role: 'system',
      text: GREETINGS[0],
    },
  ]);

  // Pending records waiting for confirmation (last system message with records)
  const [pendingRecords, setPendingRecords] = useState<ChatRecord[]>([]);
  const [pendingMsgId, setPendingMsgId] = useState<string | null>(null);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id'>) => {
    const full = { ...msg, id: msgId() };
    setMessages((prev) => [...prev, full]);
    return full.id;
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Add user message
      addMessage({ role: 'user', text: trimmed });

      // Check if it's an edit command on pending records
      if (pendingRecords.length > 0) {
        const edit = applyEditCommand(trimmed, pendingRecords);
        if (edit) {
          setPendingRecords(edit.records);
          if (pendingMsgId) {
            updateMessage(pendingMsgId, { records: edit.records, feedback: edit.feedback });
          }
          addMessage({ role: 'system', text: edit.feedback });
          return;
        }
      }

      // Parse as new records
      const parsed = parseChat(trimmed, historyIndex, categories);

      if (parsed.length === 0) {
        addMessage({
          role: 'system',
          text: 'Não consegui identificar nenhum lançamento. Tente algo como "gastei 50 no mercado" ou "paguei 120 de aluguel".',
        });
        return;
      }

      const total = parsed.reduce((a, r) => a + r.value, 0);
      const plural = parsed.length > 1;
      const systemText = plural
        ? `Identifiquei ${parsed.length} lançamentos (total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Confira abaixo:`
        : `Entendido! Confira o lançamento antes de confirmar:`;

      const sysId = addMessage({ role: 'system', text: systemText, records: parsed });
      setPendingRecords(parsed);
      setPendingMsgId(sysId);
    },
    [addMessage, updateMessage, pendingRecords, pendingMsgId, historyIndex, categories],
  );

  const updatePendingRecord = useCallback(
    (id: string, patch: Partial<ChatRecord>) => {
      setPendingRecords((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
        if (pendingMsgId) updateMessage(pendingMsgId, { records: updated });
        return updated;
      });
    },
    [pendingMsgId, updateMessage],
  );

  const removePendingRecord = useCallback(
    (id: string) => {
      setPendingRecords((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        if (pendingMsgId) updateMessage(pendingMsgId, { records: updated });
        return updated;
      });
    },
    [pendingMsgId, updateMessage],
  );

  const confirmSave = useCallback(() => {
    if (pendingMsgId) updateMessage(pendingMsgId, { saved: true });
    setPendingRecords([]);
    setPendingMsgId(null);
    addMessage({
      role: 'system',
      text: '✓ Lançamentos salvos com sucesso! Pode continuar registrando.',
    });
  }, [pendingMsgId, updateMessage, addMessage]);

  const cancelPending = useCallback(() => {
    if (pendingMsgId) updateMessage(pendingMsgId, { records: [], feedback: 'Cancelado.' });
    setPendingRecords([]);
    setPendingMsgId(null);
    addMessage({ role: 'system', text: 'Lançamentos descartados. Pode começar de novo.' });
  }, [pendingMsgId, updateMessage, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([{ id: msgId(), role: 'system', text: GREETINGS[0] }]);
    setPendingRecords([]);
    setPendingMsgId(null);
  }, []);

  return {
    messages,
    pendingRecords,
    send,
    updatePendingRecord,
    removePendingRecord,
    confirmSave,
    cancelPending,
    clearChat,
    hasPending: pendingRecords.length > 0,
  };
}
