export default function ProgressBar({ value, max = 100, label, showPercentage = true }) {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (percentage >= 80) return 'progress-success';
    if (percentage >= 60) return 'progress-warning';
    if (percentage >= 40) return 'progress-info';
    return 'progress-error';
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <progress 
        className={`progress w-full ${getColor()}`} 
        value={value} 
        max={max}
      ></progress>
    </div>
  );
}
