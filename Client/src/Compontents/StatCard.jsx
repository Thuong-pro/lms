export default function StatCard({ icon: Icon, title, value, color = 'primary', trend }) {
  return (
    <div className={`stat bg-base-100 rounded-lg shadow-md border-l-4 border-${color}`}>
      <div className="stat-figure text-lg" style={{
        color: `var(--color-${color})`
      }}>
        <Icon size={32} />
      </div>
      <div className="stat-title text-sm">{title}</div>
      <div className="stat-value text-2xl font-bold">{value}</div>
      {trend && (
        <div className="stat-desc text-xs" style={{
          color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280'
        }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% so với tháng trước
        </div>
      )}
    </div>
  );
}
