"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const PALETTE = ["#1f7d4d", "#2f9a61", "#52b57f", "#f2b807", "#0ea5e9", "#7c3aed", "#ef4444", "#64748b"];

export default function AuthorityAnalyticsPage() {
  const { lang } = useLang();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/authority/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const wasteByType = Object.entries(stats.wasteByType).map(([name, value]) => ({ name, value: Math.round((value as number) * 10) / 10 }));
  const volumeOverTime = stats.volumeOverTime.map((v: any) => ({ date: v.date.slice(5), weight: Math.round(v.weight * 10) / 10 }));
  const recycledByMaterial = Object.entries(stats.recycledByMaterial).map(([name, value]) => ({ name, value: Math.round((value as number) * 10) / 10 }));
  const byStatus = Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  const activeVsCompleted = [
    { name: lang === "ar" ? "نشطة" : "Active", value: stats.totals.activeShipments },
    { name: lang === "ar" ? "مكتملة" : "Completed", value: stats.totals.completedShipments },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "التحليلات" : "Analytics"}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "مؤشرات إعادة التدوير الوطنية" : "National recycling indicators"}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "المخلفات حسب النوع (طن)" : "Waste by Type (t)"}>
          <BarChart data={wasteByType}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {wasteByType.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title={lang === "ar" ? "حجم المخلفات عبر الزمن" : "Waste Volume Over Time"}>
          <AreaChart data={volumeOverTime}>
            <defs>
              <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f7d4d" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1f7d4d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="weight" stroke="#1f7d4d" fill="url(#vol)" strokeWidth={2} />
          </AreaChart>
        </ChartCard>

        <ChartCard title={lang === "ar" ? "الشحنات حسب الحالة" : "Shipments by Status"}>
          <BarChart data={byStatus} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#2f9a61" />
          </BarChart>
        </ChartCard>

        <ChartCard title={lang === "ar" ? "المواد المعاد تدويرها" : "Recycled Materials"}>
          <PieChart>
            <Pie data={recycledByMaterial} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {recycledByMaterial.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ChartCard>

        <ChartCard title={lang === "ar" ? "الشحنات النشطة مقابل المكتملة" : "Active vs Completed Shipments"}>
          <PieChart>
            <Pie data={activeVsCompleted} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} label>
              <Cell fill="#0ea5e9" />
              <Cell fill="#1f7d4d" />
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ChartCard>

        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">{lang === "ar" ? "معدل إعادة التدوير" : "Recycling Rate"}</p>
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[{ name: "rate", value: stats.totals.recyclingRate }, { name: "rest", value: 100 - stats.totals.recyclingRate }]}
                    dataKey="value" cx="50%" cy="50%" innerRadius={65} outerRadius={90} startAngle={90} endAngle={-270}
                  >
                    <Cell fill="#1f7d4d" />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                {stats.totals.recyclingRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-3 text-sm font-semibold">{title}</p>
        <ResponsiveContainer width="100%" height={260}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
