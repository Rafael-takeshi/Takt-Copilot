import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
