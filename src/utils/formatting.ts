import type { IndiceEficiencia } from "../types/obra";

export function getClassificacaoBadge(classificacao: IndiceEficiencia["classificacao"]) {
  const map: Record<string, string> = {
    Ótimo: "badge-otimo",
    Bom: "badge-bom",
    Regular: "badge-regular",
    Ruim: "badge-ruim",
    Crítico: "badge-critico",
  };
  return map[classificacao] ?? "";
}

export function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Concluída: "badge-concluida",
    "Em Andamento": "badge-andamento",
    Paralisada: "badge-paralisada",
    "Não Iniciada": "badge-nao-iniciada",
    Cancelada: "badge-cancelada",
  };
  return map[status] ?? "";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#06b6d4";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
