import { Blocks, Boxes, Layers, Mountain, TreePine, Waves, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const palette: { match: string[]; icon: typeof Blocks; gradient: string }[] = [
  { match: ["concrete", "خرسان"], icon: Blocks, gradient: "from-slate-400 to-slate-600" },
  { match: ["gravel", "حصى"], icon: Mountain, gradient: "from-stone-400 to-stone-600" },
  { match: ["aggregate", "ركام"], icon: Layers, gradient: "from-zinc-400 to-zinc-600" },
  { match: ["asphalt", "اسفلت", "إسفلت"], icon: Waves, gradient: "from-neutral-600 to-neutral-800" },
  { match: ["sand", "رمل"], icon: PackageOpen, gradient: "from-amber-300 to-amber-500" },
  { match: ["brick", "طوب"], icon: Boxes, gradient: "from-orange-400 to-red-500" },
  { match: ["wood", "خشب"], icon: TreePine, gradient: "from-amber-600 to-amber-800" },
  { match: ["steel", "rebar", "حديد", "metal"], icon: Boxes, gradient: "from-blue-400 to-slate-600" },
];

function pick(seed: string) {
  const s = seed.toLowerCase();
  return palette.find((p) => p.match.some((m) => s.includes(m))) ?? palette[0];
}

export function PlaceholderImage({ seed, className }: { seed: string; className?: string }) {
  const { icon: Icon, gradient } = pick(seed);
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-br", gradient, className)}>
      <div className="absolute inset-0 bg-grid opacity-20" />
      <Icon className="relative h-1/3 w-1/3 text-white/90" strokeWidth={1.5} />
    </div>
  );
}
