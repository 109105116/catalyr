import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", className)} />;
};

export default Spinner;
