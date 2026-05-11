import { useTokens } from '@/hooks/useTokens';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: isDark
          ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 75%)'
          : 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function SkeletonTableRow({ cols = 8, t }: { cols?: number; t: any }) {
  return (
    <tr style={{ borderBottom: `1px solid ${t.border.subtle}` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 24px' }}>
          <Skeleton height={14} width={i === 0 ? 160 : i === cols - 1 ? 60 : 80} borderRadius={6} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ lines = 3, t }: { lines?: number; t: any }) {
  return (
    <div
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 18,
        padding: '20px 22px',
        boxShadow: t.shadow.card,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
      }}
    >
      <Skeleton height={14} width="40%" borderRadius={6} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i % 2 === 0 ? '100%' : '70%'} borderRadius={6} />
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 4, t }: { count?: number; t: any }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} t={t} />
      ))}
    </>
  );
}

export function SkeletonList({ rows = 5, t }: { rows?: number; t: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 18px',
            borderBottom: i < rows - 1 ? `1px solid ${t.border.divider}` : 'none',
          }}
        >
          <Skeleton width={36} height={36} borderRadius={10} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            <Skeleton height={13} width="50%" borderRadius={6} />
            <Skeleton height={10} width="30%" borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail({ t }: { t: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Skeleton width={36} height={36} borderRadius={10} />
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          <Skeleton height={18} width={200} borderRadius={6} />
          <Skeleton height={12} width={140} borderRadius={6} />
        </div>
      </div>
      {}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <SkeletonCard lines={4} t={t} />
          <SkeletonCard lines={3} t={t} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <SkeletonCard lines={3} t={t} />
          <SkeletonCard lines={2} t={t} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard({ t }: { t: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
      {}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
        <SkeletonCard lines={4} t={t} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} lines={2} t={t} />
          ))}
        </div>
      </div>
      {}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <SkeletonCard lines={6} t={t} />
        <SkeletonCard lines={4} t={t} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 8, t }: { rows?: number; t: any }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${t.border.divider}` }}>
          {[
            'Descrição',
            'Categoria',
            'Data',
            'Tipo',
            'Status',
            'Valor',
            'Responsável',
            'Ações',
          ].map((h) => (
            <th key={h} style={{ padding: '12px 24px' }}>
              <Skeleton height={10} width={60} borderRadius={4} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={8} t={t} />
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCreditCards({ count = 3, t }: { count?: number; t: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          <Skeleton height={180} borderRadius={18} />
          <SkeletonCard lines={2} t={t} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonReports({ t }: { t: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
      <SkeletonCard lines={1} t={t} />
      <SkeletonCard lines={5} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SkeletonCard lines={4} t={t} />
        <SkeletonCard lines={4} t={t} />
      </div>
    </div>
  );
}
