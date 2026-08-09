import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
}

export default function SensorCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
}: SensorCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-2 flex items-end gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </span>

            {unit && (
              <span className="mb-1 text-sm text-slate-500">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>
      </div>

      {subtitle && (
        <p className="text-xs capitalize text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}