import { parseSmartInput, saveUserPattern } from './useSmartParser';
import type { HistoryEntry } from './useRecordHistory';

export interface ChatRecord {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'salary' | 'income';
  category: string;
  categoryId: string;
  confidence: 'high' | 'medium' | 'low';
  isRecurring: boolean;
  alertMsg?: string;
}

// Splits "gastei 50 no mercado e 30 no ifood" into segments
function splitCompound(text: string): string[] {
  // Split on connectors: "e", "mais", "também", "+"
  const parts = text
    .split(/\s+(?:e|mais|também|tbm|\+)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

// Normalize income/expense trigger words
function normalizeIntent(text: string): string {
  return text
    .replace(/\b(gastei|paguei|comprei|fui ao|fui na|fui no|compra de|despesa de)\b/gi, '')
    .replace(/\b(recebi|ganhei|entrou)\b/gi, 'recebi ')
    .replace(/\b(salário|salario)\b/gi, 'salário ')
    .trim();
}

function detectType(raw: string): 'expense' | 'salary' | 'income' {
  const lower = raw.toLowerCase();
  if (/\b(recebi|ganhei|entrou|salário|salario|renda|freelance|freela|bônus|bonus)\b/.test(lower)) {
    if (/\b(salário|salario|holerite)\b/.test(lower)) return 'salary';
    return 'income';
  }
  return 'expense';
}

let _idCounter = 0;
function uid() {
  return `cr_${Date.now()}_${++_idCounter}`;
}

export function parseChat(
  text: string,
  historyIndex: Record<string, HistoryEntry>,
  categories: any[],
): ChatRecord[] {
  const segments = splitCompound(text);
  const results: ChatRecord[] = [];

  for (const seg of segments) {
    const intentType = detectType(seg);
    const normalized = normalizeIntent(seg);
    const parsed = parseSmartInput(normalized || seg);

    if (!parsed && !normalized.trim()) continue;

    const description = parsed?.description || normalized || seg;
    const rawValue = parsed?.value ? parseFloat(parsed.value) : 0;
    const type = intentType !== 'expense' ? intentType : parsed?.type || 'expense';
    const category = parsed?.suggestedCategoryName || '';
    const confidence = parsed?.confidence || 'low';

    // Resolve categoryId from categories list
    const catMatch = categories.find((c) => c.name.toLowerCase() === category.toLowerCase());

    // Check history for avg value alert
    const histKey = description.toLowerCase().trim();
    const histEntry = historyIndex[histKey];
    let alertMsg: string | undefined;
    if (histEntry && histEntry.avgValue > 0 && rawValue > 0) {
      const ratio = rawValue / histEntry.avgValue;
      if (ratio > 1.5) {
        alertMsg = `${((ratio - 1) * 100).toFixed(0)}% acima da sua média (R$ ${histEntry.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
      }
    }

    const isRecurring = histEntry ? histEntry.count >= 2 && histEntry.isRecurring : false;

    results.push({
      id: uid(),
      description: description.trim(),
      value: rawValue,
      type,
      category,
      categoryId: catMatch?.id || histEntry?.categoryId || '',
      confidence,
      isRecurring,
      alertMsg,
    });
  }

  return results;
}

// Apply edit commands like "corrige gasolina para 70", "remove ifood"
export function applyEditCommand(
  command: string,
  records: ChatRecord[],
): { records: ChatRecord[]; feedback: string } | null {
  const lower = command.toLowerCase().trim();

  // Remove command
  const removeMatch = lower.match(/^(remove|remov[ae]|apaga|deleta|tira)\s+(.+)$/i);
  if (removeMatch) {
    const target = removeMatch[2].trim();
    const idx = records.findIndex((r) => r.description.toLowerCase().includes(target));
    if (idx >= 0) {
      const removed = records[idx];
      return {
        records: records.filter((_, i) => i !== idx),
        feedback: `Removido: "${removed.description}"`,
      };
    }
    return { records, feedback: `Não encontrei "${target}" nos lançamentos.` };
  }

  // Correct value: "corrige gasolina para 70" / "muda ifood pra 45"
  const correctMatch = lower.match(
    /^(corrige?|muda|altera|atualiza)\s+(.+?)\s+(?:para|pra|p\/)\s+([\d.,]+)$/i,
  );
  if (correctMatch) {
    const target = correctMatch[2].trim();
    const newVal = parseFloat(correctMatch[3].replace(',', '.'));
    const idx = records.findIndex((r) => r.description.toLowerCase().includes(target));
    if (idx >= 0 && !isNaN(newVal)) {
      const updated = records.map((r, i) => (i === idx ? { ...r, value: newVal } : r));
      return {
        records: updated,
        feedback: `"${records[idx].description}" atualizado para R$ ${newVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      };
    }
    return { records, feedback: `Não consegui aplicar a correção.` };
  }

  // Add new record: "adiciona uber 20"
  const addMatch = lower.match(/^(adiciona|add|inclui|coloca)\s+(.+)$/i);
  if (addMatch) {
    const newText = addMatch[2];
    const newRecords = parseChat(newText, {}, []);
    if (newRecords.length > 0) {
      return {
        records: [...records, ...newRecords],
        feedback: `Adicionado: "${newRecords[0].description}"`,
      };
    }
  }

  return null;
}

export { saveUserPattern };
