import type { Obra, IndiceEficiencia, TipoObra } from "../types/obra";

/**
 * Valores de referência de custo/m² por tipo de obra (em R$).
 * Baseados no CUB/RJ (Custo Unitário Básico da Construção Civil)
 * e SINAPI (Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil).
 */
const CUSTO_REFERENCIA_M2: Record<TipoObra, number> = {
  Edificação: 3_500,
  Saneamento: 5_000,
  Pavimentação: 450,
  Drenagem: 2_000,
  "Ponte/Viaduto": 12_000,
  Reforma: 2_200,
  "Contenção de Encostas": 4_500,
  "Equipamento Público": 3_000,
};

/** Pesos dos componentes do Índice de Eficiência */
const PESOS = {
  custoPorM2: 0.30,     // 30% — Eficiência de custo
  atraso: 0.30,         // 30% — Cumprimento de prazo
  recorrencia: 0.15,    // 15% — Reincidência de obras similares
  execucao: 0.25,       // 25% — Alinhamento entre execução física e financeira
};

/**
 * Calcula os dias entre duas datas ISO.
 */
function diasEntre(inicio: string, fim: string): number {
  const d1 = new Date(inicio);
  const d2 = new Date(fim);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86_400_000));
}

/**
 * Calcula o score de custo por m² (0–100).
 * Quanto mais próximo ou abaixo do custo de referência, melhor.
 */
function calcCustoPorM2Score(obra: Obra): { score: number; custoPorM2: number } {
  const custoReal = obra.valorPagoR$ > 0 ? obra.valorPagoR$ : obra.valorContratadoR$;
  const custoPorM2 = custoReal / Math.max(1, obra.areaConstruidaM2);
  const referencia = CUSTO_REFERENCIA_M2[obra.tipo];
  const ratio = custoPorM2 / referencia;

  // ratio <= 0.8 → 100, ratio >= 2.0 → 0
  let score: number;
  if (ratio <= 0.8) score = 100;
  else if (ratio >= 2.0) score = 0;
  else score = Math.round(100 * (1 - (ratio - 0.8) / 1.2));

  return { score: Math.max(0, Math.min(100, score)), custoPorM2 };
}

/**
 * Calcula o score de atraso (0–100).
 * Compara dias previstos vs. dias reais.
 */
function calcAtrasoScore(obra: Obra): { score: number; percentualAtraso: number } {
  const diasPrevistos = diasEntre(obra.dataInicioPrevista, obra.dataFimPrevista);
  const fimReal = obra.dataFimReal ?? new Date().toISOString().slice(0, 10);
  const diasReais = diasEntre(obra.dataInicioReal, fimReal);

  const percentualAtraso = Math.max(0, ((diasReais - diasPrevistos) / diasPrevistos) * 100);

  // 0% atraso → 100, >= 100% atraso → 0
  let score: number;
  if (percentualAtraso <= 0) score = 100;
  else if (percentualAtraso >= 100) score = 0;
  else score = Math.round(100 * (1 - percentualAtraso / 100));

  return { score: Math.max(0, Math.min(100, score)), percentualAtraso };
}

/**
 * Calcula o score de recorrência (0–100).
 * Penaliza obras que são reincidentes (manutenção/retrabalho frequente).
 * Penaliza adicionalmente por paralisações e aditivos.
 */
function calcRecorrenciaScore(obra: Obra): { score: number; temReincidencia: boolean } {
  let score = 100;

  if (obra.reincidencia) score -= 40;
  score -= obra.paralisacoes * 10;
  score -= obra.aditivos * 5;

  return { score: Math.max(0, Math.min(100, score)), temReincidencia: obra.reincidencia };
}

/**
 * Calcula o score de execução (0–100).
 * Avalia o alinhamento entre % físico executado e % financeiro desembolsado.
 * Grandes diferenças indicam ineficiência.
 */
function calcExecucaoScore(obra: Obra): { score: number; desvioOrcamentario: number } {
  const desvioExecucaoFinanceiro = Math.abs(obra.percentualExecutado - obra.percentualFinanceiro);
  const desvioOrcamentario = ((obra.valorPagoR$ - obra.valorContratadoR$) / Math.max(1, obra.valorContratadoR$)) * 100;

  let score = 100;
  score -= desvioExecucaoFinanceiro * 1.5; // penaliza desalinhamento físico-financeiro
  score -= Math.max(0, desvioOrcamentario) * 0.8; // penaliza estouro orçamentário

  return { score: Math.max(0, Math.min(100, Math.round(score))), desvioOrcamentario };
}

/**
 * Classifica o índice de eficiência.
 */
function classificar(indice: number): IndiceEficiencia["classificacao"] {
  if (indice >= 80) return "Ótimo";
  if (indice >= 60) return "Bom";
  if (indice >= 40) return "Regular";
  if (indice >= 20) return "Ruim";
  return "Crítico";
}

/**
 * Calcula o Índice de Eficiência de Obras Públicas (IEOP) para uma obra.
 */
export function calcularIndice(obra: Obra): IndiceEficiencia {
  const custo = calcCustoPorM2Score(obra);
  const atraso = calcAtrasoScore(obra);
  const recorrencia = calcRecorrenciaScore(obra);
  const execucao = calcExecucaoScore(obra);

  const indice = Math.round(
    custo.score * PESOS.custoPorM2 +
    atraso.score * PESOS.atraso +
    recorrencia.score * PESOS.recorrencia +
    execucao.score * PESOS.execucao
  );

  return {
    obraId: obra.id,
    nomeObra: obra.nome,
    municipio: obra.municipio,
    tipo: obra.tipo,
    status: obra.status,
    indice,
    classificacao: classificar(indice),
    componentes: {
      custoPorM2Score: custo.score,
      atrasoScore: atraso.score,
      recorrenciaScore: recorrencia.score,
      execucaoScore: execucao.score,
    },
    metricas: {
      custoPorM2: Math.round(custo.custoPorM2),
      percentualAtraso: Math.round(atraso.percentualAtraso),
      desvioOrcamentario: Math.round(execucao.desvioOrcamentario * 100) / 100,
      temReincidencia: recorrencia.temReincidencia,
    },
  };
}

/**
 * Calcula o índice para todas as obras.
 */
export function calcularIndices(obras: Obra[]): IndiceEficiencia[] {
  return obras.map(calcularIndice).sort((a, b) => b.indice - a.indice);
}

/**
 * Retorna estatísticas gerais do dataset.
 */
export function calcularEstatisticas(indices: IndiceEficiencia[]) {
  const total = indices.length;
  const mediaIndice = Math.round(indices.reduce((s, i) => s + i.indice, 0) / total);

  const porClassificacao = {
    Ótimo: indices.filter((i) => i.classificacao === "Ótimo").length,
    Bom: indices.filter((i) => i.classificacao === "Bom").length,
    Regular: indices.filter((i) => i.classificacao === "Regular").length,
    Ruim: indices.filter((i) => i.classificacao === "Ruim").length,
    Crítico: indices.filter((i) => i.classificacao === "Crítico").length,
  };

  const porStatus = {
    Concluída: indices.filter((i) => i.status === "Concluída").length,
    "Em Andamento": indices.filter((i) => i.status === "Em Andamento").length,
    Paralisada: indices.filter((i) => i.status === "Paralisada").length,
    "Não Iniciada": indices.filter((i) => i.status === "Não Iniciada").length,
    Cancelada: indices.filter((i) => i.status === "Cancelada").length,
  };

  const mediaCustoM2 = Math.round(
    indices.reduce((s, i) => s + i.metricas.custoPorM2, 0) / total
  );

  const mediaAtraso = Math.round(
    indices.reduce((s, i) => s + i.metricas.percentualAtraso, 0) / total
  );

  const taxaReincidencia = Math.round(
    (indices.filter((i) => i.metricas.temReincidencia).length / total) * 100
  );

  return {
    total,
    mediaIndice,
    porClassificacao,
    porStatus,
    mediaCustoM2,
    mediaAtraso,
    taxaReincidencia,
  };
}
