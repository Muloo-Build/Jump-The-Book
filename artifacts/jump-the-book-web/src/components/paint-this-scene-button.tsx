import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export default function PaintThisSceneButton({ onClick, disabled }: Props) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-primary text-primary-foreground hover:bg-[var(--jtb-accent-hi)] shadow-lg"
    >
      <Wand2 className="mr-2 h-4 w-4" />
      Paint this scene
    </Button>
  );
}
