export interface ParsedRecord {
  description: string;
  value: string;
  type: 'expense' | 'salary' | 'income';
  suggestedCategoryName: string;
  confidence: 'high' | 'medium' | 'low';
}

const KEYWORD_MAP: Array<{
  keywords: string[];
  category: string;
  type: 'expense' | 'salary' | 'income';
}> = [
  {
    keywords: [
      'ifood',
      'rappi',
      'uber eats',
      'delivery',
      'restaurante',
      'lanche',
      'pizza',
      'hamburguer',
      'mercado',
      'supermercado',
      'padaria',
      'açougue',
      'feira',
      'hortifruti',
      'refeição',
      'almoço',
      'jantar',
      'café',
    ],
    category: 'Alimentação',
    type: 'expense',
  },

  {
    keywords: [
      'uber',
      '99',
      'taxi',
      'táxi',
      'gasolina',
      'combustível',
      'etanol',
      'diesel',
      'estacionamento',
      'pedágio',
      'ônibus',
      'metrô',
      'trem',
      'passagem',
      'transporte',
    ],
    category: 'Transporte',
    type: 'expense',
  },

  {
    keywords: [
      'farmácia',
      'remédio',
      'medicamento',
      'consulta',
      'médico',
      'dentista',
      'exame',
      'hospital',
      'clínica',
      'plano de saúde',
      'academia',
      'gym',
    ],
    category: 'Saúde',
    type: 'expense',
  },

  {
    keywords: [
      'aluguel',
      'condomínio',
      'iptu',
      'água',
      'luz',
      'energia',
      'gás',
      'internet',
      'telefone',
      'celular',
      'tv',
      'streaming',
      'netflix',
      'spotify',
      'amazon',
    ],
    category: 'Moradia',
    type: 'expense',
  },

  {
    keywords: [
      'escola',
      'faculdade',
      'curso',
      'livro',
      'material escolar',
      'mensalidade',
      'educação',
      'aula',
      'treinamento',
    ],
    category: 'Educação',
    type: 'expense',
  },

  {
    keywords: [
      'cinema',
      'teatro',
      'show',
      'viagem',
      'hotel',
      'passeio',
      'lazer',
      'diversão',
      'jogo',
      'game',
    ],
    category: 'Lazer',
    type: 'expense',
  },

  {
    keywords: [
      'roupa',
      'calçado',
      'tênis',
      'camisa',
      'calça',
      'vestido',
      'loja',
      'shopping',
      'moda',
    ],
    category: 'Vestuário',
    type: 'expense',
  },

  {
    keywords: ['salário', 'salario', 'pagamento', 'holerite', 'contracheque', 'remuneração'],
    category: 'Salário',
    type: 'salary',
  },

  {
    keywords: [
      'freelance',
      'freela',
      'bônus',
      'bonus',
      'comissão',
      'extra',
      'renda extra',
      'dividendo',
      'investimento',
      'rendimento',
      'aluguel recebido',
      'ganhei',
      'recebi',
    ],
    category: 'Extra',
    type: 'income',
  },
];

const STORAGE_KEY = 'finfamily_smart_patterns';

function getUserPatterns(): Record<
  string,
  { category: string; type: 'expense' | 'salary' | 'income' }
> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveUserPattern(
  keyword: string,
  category: string,
  type: 'expense' | 'salary' | 'income',
) {
  const patterns = getUserPatterns();
  patterns[keyword.toLowerCase().trim()] = { category, type };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}

function extractValue(text: string): string {
  const matches = [...text.matchAll(/\d+(?:[.,]\d+)*/g)];
  if (!matches.length) return '';

  const raw = matches.reduce((a, b) => (b[0].length > a[0].length ? b : a))[0];

  const normalized = raw.replace(/\.(?=\d{3}(?!\d))/g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? '' : num.toString();
}

function extractDescription(text: string): string {
  return text
    .replace(/\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseSmartInput(text: string): ParsedRecord | null {
  if (!text || text.trim().length < 2) return null;

  const lower = text.toLowerCase().trim();
  const value = extractValue(text);
  const description = extractDescription(text) || text.trim();

  const userPatterns = getUserPatterns();
  for (const [keyword, data] of Object.entries(userPatterns)) {
    if (lower.includes(keyword)) {
      return {
        description,
        value,
        type: data.type,
        suggestedCategoryName: data.category,
        confidence: 'high',
      };
    }
  }

  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return {
          description,
          value,
          type: entry.type,
          suggestedCategoryName: entry.category,
          confidence: 'medium',
        };
      }
    }
  }

  if (value) {
    return { description, value, type: 'expense', suggestedCategoryName: '', confidence: 'low' };
  }

  return null;
}
