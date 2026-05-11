import moment from 'moment';

export type QuickLaunchType = 'expense' | 'income' | 'salary';

export interface ParsedLaunch {
  description: string;
  amount: number | null;
  date: string;
  type: QuickLaunchType;
  categoryHint: string | null;
  personHint: string | null;
  confidence: number;
  missingFields: string[];
}

function localDate(offsetDays = 0): string {
  return moment().add(offsetDays, 'days').format('YYYY-MM-DD');
}

export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const DATE_WORDS: Record<string, number> = { hoje: 0, ontem: -1, amanha: 1 };

const INCOME_VERBS = ['recebi', 'ganhei', 'entrou', 'caiu', 'me deu', 'me pagou', 'me mandou'];

const EXPENSE_VERBS = ['enviei', 'paguei', 'transferi', 'mandei', 'dei', 'gastei', 'mande'];

const SALARY_HINTS = ['salario', 'salary', 'contracheque', 'holerite'];

const TRANSFER_HINTS = ['pix', 'transferencia', 'ted', 'doc'];

const FAMILY_LABELS: Record<string, string> = {
  pai: 'meu pai',
  mae: 'minha mãe',
  irmao: 'meu irmão',
  irma: 'minha irmã',
  avo: 'meu avô',
  avo2: 'minha avó',
  tio: 'meu tio',
  tia: 'minha tia',
  primo: 'meu primo',
  prima: 'minha prima',
  marido: 'meu marido',
  esposo: 'meu esposo',
  esposa: 'minha esposa',
  namorado: 'meu namorado',
  namorada: 'minha namorada',
  filho: 'meu filho',
  filha: 'minha filha',
};

const FAMILY_ALIASES: Record<string, string> = {
  pai: 'pai',
  'meu pai': 'pai',
  mae: 'mae',
  'minha mae': 'mae',
  irmao: 'irmao',
  'meu irmao': 'irmao',
  irma: 'irma',
  'minha irma': 'irma',
  avo: 'avo',
  'meu avo': 'avo',
  'minha avo': 'avo2',
  tio: 'tio',
  'meu tio': 'tio',
  tia: 'tia',
  'minha tia': 'tia',
  primo: 'primo',
  'meu primo': 'primo',
  prima: 'prima',
  'minha prima': 'prima',
  marido: 'marido',
  'meu marido': 'marido',
  esposo: 'esposo',
  'meu esposo': 'esposo',
  esposa: 'esposa',
  'minha esposa': 'esposa',
  namorado: 'namorado',
  'meu namorado': 'namorado',
  namorada: 'namorada',
  'minha namorada': 'namorada',
  filho: 'filho',
  'meu filho': 'filho',
  filha: 'filha',
  'minha filha': 'filha',
};

const INCOME_KEYWORDS = [
  'salario',
  'bonus',
  'extra',
  'renda',
  'recebimento',
  'freelance',
  'dividendo',
  'rendimento',
  'reembolso',
  'comissao',
];

const CATEGORY_MAP: Record<string, string> = {
  mercado: 'Alimentação',
  supermercado: 'Alimentação',
  ifood: 'Alimentação',
  restaurante: 'Alimentação',
  lanche: 'Alimentação',
  padaria: 'Alimentação',
  gasolina: 'Transporte',
  combustivel: 'Transporte',
  uber: 'Transporte',
  onibus: 'Transporte',
  metro: 'Transporte',
  aluguel: 'Moradia',
  condominio: 'Moradia',
  celesc: 'Moradia',
  copel: 'Moradia',
  cemig: 'Moradia',
  luz: 'Moradia',
  agua: 'Moradia',
  internet: 'Moradia',
  netflix: 'Lazer',
  spotify: 'Lazer',
  cinema: 'Lazer',
  academia: 'Saúde',
  farmacia: 'Saúde',
  medico: 'Saúde',
  plano: 'Saúde',
  petshop: 'Pet',
  pet: 'Pet',
  racao: 'Pet',
  escola: 'Educação',
  faculdade: 'Educação',
  curso: 'Educação',
  salario: 'Salário',
  bonus: 'Rendimentos',
  extra: 'Rendimentos',
  transferencia: 'Transferência',
  pix: 'Transferência',
};

function extractAmount(text: string): { amount: number | null; rest: string } {
  const match = text.match(/\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\b/);
  if (!match) return { amount: null, rest: text };
  const raw = match[1].replace(/\./g, '').replace(',', '.');
  const amount = parseFloat(raw);
  const rest =
    text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim();
  return { amount: isNaN(amount) ? null : amount, rest: rest.trim() };
}

function extractDate(tokens: string[]): { date: string; usedIndices: Set<number> } {
  const used = new Set<number>();
  let date = localDate(0);

  for (let i = 0; i < tokens.length; i++) {
    const t = norm(tokens[i]);
    if (t in DATE_WORDS) {
      date = localDate(DATE_WORDS[t]);
      used.add(i);
      break;
    }
    if (t === 'dia' && i + 1 < tokens.length) {
      const day = parseInt(tokens[i + 1]);
      if (!isNaN(day) && day >= 1 && day <= 31) {
        date = moment().date(day).format('YYYY-MM-DD');
        used.add(i);
        used.add(i + 1);
        break;
      }
    }
    const dm = t.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (dm) {
      date = moment()
        .date(parseInt(dm[1]))
        .month(parseInt(dm[2]) - 1)
        .format('YYYY-MM-DD');
      used.add(i);
      break;
    }
  }

  return { date, usedIndices: used };
}

function cleanForDescription(text: string): string {
  return text
    .replace(/\d[\d.,]*/g, '')
    .replace(/\b(reais|real|r\$)\b/gi, '')
    .replace(/\b(no\s+dia|dia|hoje|ontem|amanha)\b/gi, '')
    .replace(/\d{1,2}[/-]\d{1,2}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveFamilyLabel(n: string): string | null {
  const twoWord = n.match(/\b(meu|minha)\s+(\w+)\b/);
  if (twoWord) {
    const key = norm(`${twoWord[1]} ${twoWord[2]}`);
    const canonical = FAMILY_ALIASES[key];
    if (canonical) return FAMILY_LABELS[canonical] ?? null;
  }

  for (const [alias, canonical] of Object.entries(FAMILY_ALIASES)) {
    if (n.includes(alias)) return FAMILY_LABELS[canonical] ?? null;
  }
  return null;
}

interface PersonContext {
  label: string;
  memberId: string | null;
  isFamilyRelative: boolean;
}

function extractOrigin(n: string, members: { id: string; name: string }[]): PersonContext | null {
  const member = members.find((m) => n.includes(norm(m.name)));
  if (member) return { label: member.name, memberId: member.id, isFamilyRelative: false };

  const familyLabel = resolveFamilyLabel(n);
  if (familyLabel) return { label: familyLabel, memberId: null, isFamilyRelative: true };

  const fromMatch = n.match(
    /\b(?:do|da|de|dos|das)\s+([a-záéíóúãõâêîôûç]+(?:\s+[a-záéíóúãõâêîôûç]+)?)\b/,
  );
  if (fromMatch) {
    const name = fromMatch[1].replace(/\b\w/g, (c) => c.toUpperCase());
    if (!['meu', 'minha', 'seu', 'sua', 'um', 'uma'].includes(fromMatch[1])) {
      return { label: name, memberId: null, isFamilyRelative: false };
    }
  }

  return null;
}

function extractDestination(
  n: string,
  members: { id: string; name: string }[],
): PersonContext | null {
  const member = members.find((m) => n.includes(norm(m.name)));
  if (member) return { label: member.name, memberId: member.id, isFamilyRelative: false };

  const familyLabel = resolveFamilyLabel(n);
  if (familyLabel) return { label: familyLabel, memberId: null, isFamilyRelative: true };

  const toMatch = n.match(
    /\b(?:para|pro|pra|pras|pros|ao|a)\s+([a-záéíóúãõâêîôûç]+(?:\s+[a-záéíóúãõâêîôûç]+)?)\b/,
  );
  if (toMatch) {
    const name = toMatch[1].replace(/\b\w/g, (c) => c.toUpperCase());
    if (!['meu', 'minha', 'seu', 'sua', 'um', 'uma', 'o', 'a'].includes(toMatch[1])) {
      return { label: name, memberId: null, isFamilyRelative: false };
    }
  }

  return null;
}

interface NaturalMatch {
  type: QuickLaunchType;
  description: string;
  categoryName: string;
  amount: number | null;
  personName: string | null;
  personId: string | null;
}

function tryNaturalLanguage(
  raw: string,
  members: { id: string; name: string }[],
): NaturalMatch | null {
  const n = norm(raw);
  const { amount } = extractAmount(raw);

  const incomeVerb = INCOME_VERBS.find(
    (v) => n.startsWith(v + ' ') || n.includes(' ' + v + ' ') || n === v,
  );
  const expenseVerb = EXPENSE_VERBS.find(
    (v) => n.startsWith(v + ' ') || n.includes(' ' + v + ' ') || n === v,
  );

  const subjectVerbMatch =
    !incomeVerb && !expenseVerb ? n.match(/^(.+?)\s+(me\s+deu|me\s+pagou|me\s+mandou)\b/) : null;

  const isIncome = !!incomeVerb || !!subjectVerbMatch;
  const isExpense = !!expenseVerb;

  if (!isIncome && !isExpense) return null;

  if (isIncome) {
    if (SALARY_HINTS.some((h) => n.includes(h))) {
      return {
        type: 'salary',
        description: 'Salário',
        categoryName: 'Salário',
        amount,
        personName: null,
        personId: null,
      };
    }

    if (subjectVerbMatch) {
      const subjectRaw = subjectVerbMatch[1];
      const origin = extractOrigin(subjectRaw, members);
      const label = origin?.label ?? subjectRaw.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
      const prep = label.toLowerCase().startsWith('minha') ? 'da' : 'do';
      return {
        type: 'income',
        description: `Ganhei ${prep} ${label}`,
        categoryName: 'Rendimentos',
        amount,
        personName: origin?.memberId ? label : null,
        personId: origin?.memberId ?? null,
      };
    }

    const origin = extractOrigin(n, members);
    if (origin) {
      const prep = origin.label.toLowerCase().startsWith('minha') ? 'da' : 'do';
      return {
        type: 'income',
        description: `Ganhei ${prep} ${origin.label}`,
        categoryName: 'Rendimentos',
        amount,
        personName: origin.memberId ? origin.label : null,
        personId: origin.memberId,
      };
    }

    const cleaned = cleanForDescription(raw.replace(new RegExp(incomeVerb ?? '', 'i'), ''));
    return {
      type: 'income',
      description: cleaned.length > 2 ? `Recebi ${cleaned}` : 'Receita',
      categoryName: 'Rendimentos',
      amount,
      personName: null,
      personId: null,
    };
  }

  const destination = extractDestination(n, members);
  const hasTransfer = TRANSFER_HINTS.some((h) => n.includes(h));

  if (destination) {
    const prep =
      destination.label.toLowerCase().startsWith('minha') ||
      destination.label.toLowerCase().startsWith('meu')
        ? 'para'
        : 'a';
    return {
      type: 'expense',
      description: `Paguei ${prep} ${destination.label}`,
      categoryName: hasTransfer ? 'Transferência' : 'Despesa Pessoal',
      amount,
      personName: destination.memberId ? destination.label : null,
      personId: destination.memberId,
    };
  }

  const cleaned = cleanForDescription(raw.replace(new RegExp(expenseVerb ?? '', 'i'), ''));
  return {
    type: 'expense',
    description: cleaned.length > 2 ? `Paguei ${cleaned}` : 'Despesa',
    categoryName: hasTransfer ? 'Transferência' : 'Despesa Pessoal',
    amount,
    personName: null,
    personId: null,
  };
}

export function parseQuickLaunch(
  text: string,
  familyMembers: { id: string; name: string }[] = [],
  categories: { id: string; name: string }[] = [],
): ParsedLaunch {
  const raw = text.trim();
  if (!raw) {
    return {
      description: '',
      amount: null,
      date: localDate(0),
      type: 'expense',
      categoryHint: null,
      personHint: null,
      confidence: 0,
      missingFields: ['description', 'amount'],
    };
  }

  const tokens = raw.split(/\s+/);
  const { date, usedIndices } = extractDate(tokens);

  const natural = tryNaturalLanguage(raw, familyMembers);

  if (natural) {
    const categoryHint = resolveCategory(natural.categoryName, categories);
    const personHint =
      natural.personId ??
      (natural.personName
        ? (familyMembers.find((m) => norm(m.name) === norm(natural.personName!))?.id ?? null)
        : null);

    const missingFields: string[] = [];
    if (!natural.description) missingFields.push('description');
    if (natural.amount === null) missingFields.push('amount');

    let confidence = 0.4;
    if (natural.amount !== null) confidence += 0.4;
    if (categoryHint) confidence += 0.1;
    if (personHint) confidence += 0.1;

    return {
      description: natural.description,
      amount: natural.amount,
      date,
      type: natural.type,
      categoryHint,
      personHint,
      confidence,
      missingFields,
    };
  }

  const used = new Set(usedIndices);

  let amount: number | null = null;
  for (let i = 0; i < tokens.length; i++) {
    if (!/^[\d.,]+$/.test(tokens[i])) continue;
    const v = parseFloat(tokens[i].replace(',', '.'));
    if (!isNaN(v) && v > 0) {
      amount = v;
      used.add(i);
      break;
    }
  }

  const descIdx = tokens.findIndex((_, i) => !used.has(i));

  let personHint: string | null = null;
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i) || i === descIdx) continue;
    const t = norm(tokens[i]);
    const match = familyMembers.find((m) => norm(m.name).startsWith(t) && t.length >= 3);
    if (match) {
      personHint = match.id;
      used.add(i);
      break;
    }
  }

  let categoryHint: string | null = null;
  if (descIdx >= 0) {
    const t = norm(tokens[descIdx]);
    const mapped = CATEGORY_MAP[t];
    if (mapped) categoryHint = resolveCategory(mapped, categories);
  }
  if (!categoryHint) {
    for (let i = 0; i < tokens.length; i++) {
      if (used.has(i) || i === descIdx) continue;
      const t = norm(tokens[i]);
      const direct = categories.find((c) => norm(c.name) === t);
      if (direct) {
        categoryHint = direct.id;
        used.add(i);
        break;
      }
      const mapped = CATEGORY_MAP[t];
      if (mapped) {
        categoryHint = resolveCategory(mapped, categories);
        used.add(i);
        break;
      }
    }
  }

  const normRaw = norm(raw);
  let type: QuickLaunchType = 'expense';
  if (INCOME_KEYWORDS.some((kw) => normRaw.includes(kw))) {
    type = normRaw.includes('salario') ? 'salary' : 'income';
  }

  const descTokens = tokens.filter((_, i) => !used.has(i));
  const description = descTokens.length > 0 ? descTokens.join(' ').trim() : (tokens[0] ?? '');

  const missingFields: string[] = [];
  if (!description) missingFields.push('description');
  if (amount === null) missingFields.push('amount');

  let confidence = 0;
  if (description) confidence += 0.3;
  if (amount !== null) confidence += 0.4;
  if (categoryHint) confidence += 0.2;
  if (personHint) confidence += 0.1;

  return { description, amount, date, type, categoryHint, personHint, confidence, missingFields };
}

function resolveCategory(name: string, categories: { id: string; name: string }[]): string | null {
  const found = categories.find((c) => norm(c.name) === norm(name));
  return found?.id ?? name;
}

export function resolveCategoryName(
  hint: string | null,
  categories: { id: string; name: string }[],
): string | null {
  if (!hint) return null;
  return categories.find((c) => c.id === hint)?.name ?? hint;
}
