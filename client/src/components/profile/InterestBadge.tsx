interface InterestBadgeProps {
  interest: string;
  onClick?: () => void;
  selected?: boolean;
  selectable?: boolean;
}

export default function InterestBadge({ 
  interest, 
  onClick, 
  selected = false,
  selectable = false
}: InterestBadgeProps) {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
  
  // Different style for selected interests if they're selectable
  const classes = selectable
    ? selected
      ? "bg-primary text-white transition-colors"
      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
    : "bg-neutral-100 text-neutral-700";
  
  return (
    <span 
      className={`${baseClasses} ${classes}`}
      onClick={selectable ? onClick : undefined}
    >
      {interest}
    </span>
  );
}
