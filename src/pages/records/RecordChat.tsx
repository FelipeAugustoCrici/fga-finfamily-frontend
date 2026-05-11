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
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRecordHistory } from './hooks/useRecordHistory';
import { useConversationalChat } from './hooks/useConversationalChat';
import { useCreateRecord } from './hooks/useCreateRecord';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import type { ChatRecord } from './hooks/useChatParser';

const TYPE_META = {
  expense: { label: 'Despesa', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  salary: { label: 'Salário', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  income: { label: 'Extra', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

const QUICK_HINTS = [
  'gastei 120 no mercado',
  'recebi 3000 de salário',
  'paguei 50 de gasolina e 30 no ifood',
  'netflix 45',
  'uber 18',
];

export function RecordChat() {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <PageHeader />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: t.shadow.card,
          height: 'calc(100vh - 200px)',
          minHeight: 500,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${t.border.divider}`,
            background: isDark ? 'rgba(99,102,241,0.06)' : '#f5f3ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>FinFamily AI</p>
              <p style={{ fontSize: 11, color: t.text.muted }}>Assistente de lançamentos</p>
            </div>
          </div>
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
              gap: 4,
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 8,
            }}
          >
            <Trash2 size={13} /> Limpar
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 20px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
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
                  <User size={14} color={isDark ? '#a5b4fc' : '#4338ca'} />
                ) : (
                  <Bot size={14} color="#fff" />
                )}
              </div>

              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Bubble */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
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
                  <p style={{ fontSize: 13, color: t.text.primary, lineHeight: 1.5 }}>{msg.text}</p>
                </div>

                {/* Record preview cards */}
                {msg.records && msg.records.length > 0 && !msg.saved && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                            borderRadius: 14,
                            padding: '12px 14px',
                            opacity: isPending ? 1 : 0.5,
                          }}
                        >
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <input
                                autoFocus
                                value={editValues.description ?? rec.description}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, description: e.target.value }))
                                }
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  fontSize: 13,
                                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.4)' : '#a5b4fc'}`,
                                  background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                                  color: t.text.primary,
                                  outline: 'none',
                                }}
                                placeholder="Descrição"
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
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
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    fontSize: 13,
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
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#6366f1',
                                    color: '#fff',
                                    fontSize: 12,
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
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    color: t.text.muted,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: 4,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
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
                                      size={11}
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
                                    gap: 6,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      padding: '2px 7px',
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
                                        gap: 3,
                                        fontSize: 10,
                                        color: isDark ? '#fcd34d' : '#d97706',
                                      }}
                                    >
                                      <AlertTriangle size={10} /> {rec.alertMsg}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 15,
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
                                        padding: 4,
                                        borderRadius: 6,
                                      }}
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removePendingRecord(rec.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isDark ? '#fca5a5' : '#dc2626',
                                        padding: 4,
                                        borderRadius: 6,
                                      }}
                                    >
                                      <X size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Confirm / Cancel buttons — only on the last pending message */}
                    {hasPending &&
                      msg.records.some((r) => pendingRecords.find((p) => p.id === r.id)) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSaving || pendingRecords.length === 0 || !personId}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '10px 16px',
                              borderRadius: 12,
                              border: 'none',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              opacity: isSaving ? 0.7 : 1,
                            }}
                          >
                            {isSaving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            {isSaving
                              ? 'Salvando...'
                              : `Confirmar ${pendingRecords.length > 1 ? `${pendingRecords.length} lançamentos` : 'lançamento'}`}
                          </button>
                          <button
                            type="button"
                            onClick={cancelPending}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: `1px solid ${cardBorder}`,
                              background: 'none',
                              color: t.text.muted,
                              fontSize: 13,
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
                      gap: 6,
                      fontSize: 11,
                      color: isDark ? '#6ee7b7' : '#059669',
                    }}
                  >
                    <Check size={12} /> Salvo
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
            padding: '8px 20px',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            borderTop: `1px solid ${t.border.divider}`,
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
                fontSize: 11,
                padding: '4px 10px',
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
            padding: '12px 16px',
            borderTop: `1px solid ${t.border.divider}`,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasPending
                ? 'Corrija ou confirme os lançamentos acima...'
                : 'Digite o que quer lançar...'
            }
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe'}`,
              background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              color: t.text.primary,
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
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
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
