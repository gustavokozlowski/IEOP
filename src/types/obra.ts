/** Representa uma obra pública do estado do RJ */
export interface Obra {
  id: string;
  nome: string;
  municipio: string;
  tipo: TipoObra;
  orgaoResponsavel: string;
  status: StatusObra;

  // Dimensões
  areaConstruidaM2: number;

  // Custos
  valorContratadoR$: number;
  valorPagoR$: number;

  // Prazos
  dataInicioPrevista: string; // ISO date
  dataFimPrevista: string;
  dataInicioReal: string;
  dataFimReal: string | null; // null se ainda em andamento

  // Percentuais
  percentualExecutado: number; // 0-100
  percentualFinanceiro: number; // 0-100

  // Controle
  aditivos: number; // quantidade de aditivos contratuais
  paralisacoes: number; // quantidade de paralisações
  reincidencia: boolean; // se já houve obra similar recente no mesmo município
}

export type TipoObra =
  | "Edificação"
  | "Saneamento"
  | "Pavimentação"
  | "Drenagem"
  | "Ponte/Viaduto"
  | "Reforma"
  | "Contenção de Encostas"
  | "Equipamento Público";

export type StatusObra =
  | "Concluída"
  | "Em Andamento"
  | "Paralisada"
  | "Não Iniciada"
  | "Cancelada";

/** Resultado do cálculo do Índice de Eficiência */
export interface IndiceEficiencia {
  obraId: string;
  nomeObra: string;
  municipio: string;
  tipo: TipoObra;
  status: StatusObra;
  /** Índice final 0-100 */
  indice: number;
  /** Classificação qualitativa */
  classificacao: "Ótimo" | "Bom" | "Regular" | "Ruim" | "Crítico";
  /** Componentes do índice */
  componentes: {
    custoPorM2Score: number; // 0-100
    atrasoScore: number; // 0-100
    recorrenciaScore: number; // 0-100
    execucaoScore: number; // 0-100
  };
  /** Valores brutos */
  metricas: {
    custoPorM2: number;
    percentualAtraso: number;
    desvioOrcamentario: number; // percentual
    temReincidencia: boolean;
  };
}

/** Metadados do dataset conforme API dados.gov.br */
export interface ConjuntoDadosMetadata {
  id: string;
  titulo: string;
  descricao: string;
  organizacao: string;
  urlRecurso: string;
  formato: string;
  ultimaAtualizacao: string;
}
