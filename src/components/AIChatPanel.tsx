import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Check,
  X,
  Pencil,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  Loader2,
  Minus,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useRecordHistory } from '@/pages/records/hooks/useRecordHistory';
import { useConversationalChat } from '@/pages/records/hooks/useConversationalChat';
import { useCreateRecord } from '@/pages/records/hooks/useCreateRecord';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import type { ChatRecord } from '@/pages/records/hooks/useChatParser';

const TYPE_META = {
  expense: { label: 'Despesa', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  salary: { label: 'Salário', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  income: { label: 'Extra', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

const QUICK_HINTS = [
  'gastei 120 no mercado',
  'recebi 3000 de salário',
  'paguei 50 de gasolina',
  'netflix 45',
  'uber 18',
];

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ChatRecord>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: currentPerson } = useCurrentPerson();
  const { data: categories = [] } = useCategories();

  const familyId = currentPerson?.familyId ?? '';
  const personId = currentPerson?.personId ?? '';

  const { index: historyIndex } = useRecordHistory(familyId);
  const createRecord = useCreateRecord();

  const {
    messages,
    pendingRecords,
    send,
    updatePendingRecord,
    removePendingRecord,
    confirmSave,
    cancelPending,
    clearChat,
    hasPending,
  } = useConversationalChat(historyIndex, categories);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInput('');
    send(val);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') onClose();
  };

  const handleConfirm = async () => {
    if (!familyId || !personId) return;
    setIsSaving(true);
    try {
      for (const rec of pendingRecords) {
        await createRecord.mutateAsync({
          description: rec.description,
          value: rec.value.toString(),
          date: new Date().toISOString().split('T')[0],
          type: rec.type,
          categoryId: rec.categoryId || undefined,
          categoryName: rec.category || undefined,
          personId,
          familyId,
          isRecurring: rec.isRecurring,
          durationMonths: undefined,
          isShared: true,
        } as any);
      }
      confirmSave();
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (rec: ChatRecord) => {
    setEditingId(rec.id);
    setEditValues({ description: rec.description, value: rec.value, category: rec.category });
  };

  const commitEdit = (id: string) => {
    updatePendingRecord(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  if (!open) return null;

  return (
    <>
      {/* Backdrop (subtle) */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 199,
          background: 'transparent',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 90,
          right: 28,
          zIndex: 200,
          width: 400,
          maxWidth: 'calc(100vw - 40px)',
          height: 560,
          maxHeight: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.card,
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#e0e7ff'}`,
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(99,102,241,0.15)',
          overflow: 'hidden',
          animation: 'chatPanelIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${t.border.divider}`,
            background: isDark ? 'rgba(99,102,241,0.06)' : '#f5f3ff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>FinFamily AI</p>
              <p style={{ fontSize: 10, color: t.text.muted }}>Assistente de lançamentos</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={clearChat}
              title="Limpar conversa"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.text.muted,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              <Trash2 size={12} /> Limpar
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Fechar"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.text.muted,
                padding: '4px 6px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  flexShrink: 0,
                  background:
                    msg.role === 'user'
                      ? isDark
                        ? 'rgba(99,102,241,0.2)'
                        : '#e0e7ff'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {msg.role === 'user' ? (
                  <User size={12} color={isDark ? '#a5b4fc' : '#4338ca'} />
                ) : (
                  <Bot size={12} color="#fff" />
                )}
              </div>

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    background:
                      msg.role === 'user'
                        ? isDark
                          ? 'rgba(99,102,241,0.18)'
                          : '#e0e7ff'
                        : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : '#f1f5f9',
                    border: `1px solid ${
                      msg.role === 'user'
                        ? isDark
                          ? 'rgba(99,102,241,0.3)'
                          : '#c7d2fe'
                        : cardBorder
                    }`,
                  }}
                >
                  <p style={{ fontSize: 12, color: t.text.primary, lineHeight: 1.5 }}>{msg.text}</p>
                </div>

                {msg.records && msg.records.length > 0 && !msg.saved && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {msg.records.map((rec) => {
                      const isEditing = editingId === rec.id;
                      const meta = TYPE_META[rec.type] || TYPE_META.expense;
                      const isPending = pendingRecords.some((p) => p.id === rec.id);

                      return (
                        <div
                          key={rec.id}
                          style={{
                            background: cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderRadius: 12,
                            padding: '10px 12px',
                            opacity: isPending ? 1 : 0.5,
                          }}
                        >
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input
                                autoFocus
                                value={editValues.description ?? rec.description}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, description: e.target.value }))
                                }
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 7,
                                  fontSize: 12,
                                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.4)' : '#a5b4fc'}`,
                                  background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                                  color: t.text.primary,
                                  outline: 'none',
                                }}
                                placeholder="Descrição"
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  type="number"
                                  value={editValues.value ?? rec.value}
                                  onChange={(e) =>
                                    setEditValues((v) => ({
                                      ...v,
                                      value: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    borderRadius: 7,
                                    fontSize: 12,
                                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.4)' : '#a5b4fc'}`,
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                                    color: t.text.primary,
                                    outline: 'none',
                                  }}
                                  placeholder="Valor"
                                />
                                <button
                                  type="button"
                                  onClick={() => commitEdit(rec.id)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: 7,
                                    border: 'none',
                                    background: '#6366f1',
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: 7,
                                    border: 'none',
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    color: t.text.muted,
                                    fontSize: 11,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    marginBottom: 3,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: t.text.primary,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {rec.description}
                                  </p>
                                  {rec.isRecurring && (
                                    <RefreshCw
                                      size={10}
                                      style={{
                                        color: isDark ? '#a5b4fc' : '#6366f1',
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: 999,
                                      background: meta.bg,
                                      color: meta.color,
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    {meta.label}
                                  </span>
                                  {rec.category && (
                                    <span style={{ fontSize: 10, color: t.text.muted }}>
                                      {rec.category}
                                    </span>
                                  )}
                                  {rec.alertMsg && (
                                    <span
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontSize: 10,
                                        color: isDark ? '#fcd34d' : '#d97706',
                                      }}
                                    >
                                      <AlertTriangle size={9} /> {rec.alertMsg}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color:
                                      rec.type === 'expense'
                                        ? isDark
                                          ? '#fca5a5'
                                          : '#dc2626'
                                        : isDark
                                          ? '#6ee7b7'
                                          : '#059669',
                                  }}
                                >
                                  {rec.type === 'expense' ? '-' : '+'}R${' '}
                                  {rec.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startEdit(rec)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: t.text.muted,
                                        padding: 3,
                                        borderRadius: 5,
                                      }}
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removePendingRecord(rec.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isDark ? '#fca5a5' : '#dc2626',
                                        padding: 3,
                                        borderRadius: 5,
                                      }}
                                    >
                                      <X size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {hasPending &&
                      msg.records.some((r) => pendingRecords.find((p) => p.id === r.id)) && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSaving || pendingRecords.length === 0 || !personId}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: 'none',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              opacity: isSaving ? 0.7 : 1,
                            }}
                          >
                            {isSaving ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            {isSaving
                              ? 'Salvando...'
                              : `Confirmar ${pendingRecords.length > 1 ? `${pendingRecords.length} lançamentos` : 'lançamento'}`}
                          </button>
                          <button
                            type="button"
                            onClick={cancelPending}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: `1px solid ${cardBorder}`,
                              background: 'none',
                              color: t.text.muted,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {msg.saved && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      color: isDark ? '#6ee7b7' : '#059669',
                    }}
                  >
                    <Check size={11} /> Salvo
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick hints */}
        <div
          style={{
            padding: '6px 14px',
            display: 'flex',
            gap: 5,
            flexWrap: 'wrap',
            borderTop: `1px solid ${t.border.divider}`,
            flexShrink: 0,
          }}
        >
          {QUICK_HINTS.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => {
                setInput(hint);
                inputRef.current?.focus();
              }}
              style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 999,
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#c7d2fe'}`,
                background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
                color: isDark ? '#a5b4fc' : '#4338ca',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {hint}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: `1px solid ${t.border.divider}`,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasPending ? 'Corrija ou confirme...' : 'Digite o que quer lançar...'}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 10,
              border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe'}`,
              background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              color: t.text.primary,
              fontSize: 12,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: 'none',
              background: input.trim()
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : isDark
                  ? 'rgba(255,255,255,0.06)'
                  : '#f1f5f9',
              color: input.trim() ? '#fff' : t.text.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatPanelIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
