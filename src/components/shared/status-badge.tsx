import { Badge, statusColorToVariant } from "@/components/ui/badge";
import { statusLabels } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function StatusBadge({ status, lang }: { status: string; lang: Lang }) {
  const meta = statusLabels[status];
  if (!meta) return <Badge variant="gray">{status}</Badge>;
  return <Badge variant={statusColorToVariant[meta.color]}>{lang === "ar" ? meta.ar : meta.en}</Badge>;
}
