import { ArrowUp, ArrowDown, AlertCircle, Target } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  type: "up" | "down" | "warning" | "target";
}

const iconMap = {
  up: <ArrowUp className="h-5 w-5 text-success" />,
  down: <ArrowDown className="h-5 w-5 text-destructive" />,
  warning: <AlertCircle className="h-5 w-5 text-warning" />,
  target: <Target className="h-5 w-5 text-primary" />,
};

const subtitleColor = {
  up: "text-success",
  down: "text-destructive",
  warning: "text-warning",
  target: "text-primary",
};

const StatCard = ({ title, value, subtitle, type }: StatCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
          <p className={`mt-1 text-xs ${subtitleColor[type]}`}>{subtitle}</p>
        </div>
        {iconMap[type]}
      </div>
    </div>
  );
};

export default StatCard;
