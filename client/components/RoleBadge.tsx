import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleBadgeProps {
  role?: string;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  if (!role || role === "member") return null;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const containerClasses = {
    sm: "p-0.5",
    md: "p-1",
    lg: "p-1.5",
  };

  if (role === "founder") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${containerClasses[size]} hover:scale-110 transition-transform cursor-help`}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F6efe5c975de742218614020f75c6e644%2Fb430cdb925bf47f09a9d7c95a02f3bd0?format=webp&width=800"
              alt="Founder"
              className={`${sizeClasses[size]}`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Founder
        </TooltipContent>
      </Tooltip>
    );
  }

  if (role === "admin") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${containerClasses[size]} hover:scale-110 transition-transform cursor-help`}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F6efe5c975de742218614020f75c6e644%2Fb5f004c16bc84ddd977be6eea56f8f20?format=webp&width=800"
              alt="Admin"
              className={`${sizeClasses[size]}`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Admin
        </TooltipContent>
      </Tooltip>
    );
  }

  if (role === "support") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${containerClasses[size]} hover:scale-110 transition-transform cursor-help opacity-75 hover:opacity-100`}
          >
            <img
              src="https://cdn3.emoji.gg/emojis/9204-admin-badge.png"
              alt="Support"
              className={`${sizeClasses[size]}`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Support
        </TooltipContent>
      </Tooltip>
    );
  }

  if (role === "partner") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="https://cdn3.emoji.gg/emojis/42747-roblox-verified.png"
            alt="Partner"
            className={`${sizeClasses[size]} hover:scale-110 transition-transform cursor-help`}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Partner
        </TooltipContent>
      </Tooltip>
    );
  }

  return null;
}
