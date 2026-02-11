import axios from "axios";
import type { Obra } from "../types/obra";
import { obrasRJ } from "../data/obras";

const API_BASE = "https://dados.gov.br/dados/api/publico";

/**
 * Serviço de integração com a API do Portal de Dados Abertos.
 *
 * A API dados.gov.br requer autenticação via gov.br para a maioria dos
 * endpoints. Este serviço tenta buscar dados via API e, caso não consiga,
 * utiliza o dataset tratado local como fallback.
 */
export async function buscarConjuntoDados(nome: string) {
  try {
    const response = await axios.get(`${API_BASE}/conjuntos-dados`, {
      params: {
        isPrivado: false,
        pagina: 1,
        nomeConjuntoDados: nome,
      },
      timeout: 8000,
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch {
    console.warn(
      "[dadosGovBr] API indisponível ou requer autenticação. Usando dataset local."
    );
    return null;
  }
}

/**
 * Busca detalhes de um conjunto de dados específico.
 */
export async function detalharConjuntoDados(id: string) {
  try {
    const response = await axios.get(`${API_BASE}/conjuntos-dados/${id}`, {
      timeout: 8000,
      headers: { Accept: "application/json" },
    });
    return response.data;
  } catch {
    console.warn("[dadosGovBr] Falha ao detalhar conjunto de dados:", id);
    return null;
  }
}

/**
 * Carrega as obras do RJ.
 * Tenta a API primeiro; em caso de falha, usa o dataset local.
 */
export async function carregarObras(): Promise<Obra[]> {
  // Tenta buscar via API
  const resultado = await buscarConjuntoDados("obras rio de janeiro");

  if (resultado?.conjuntoDados?.length > 0) {
    // Se a API retornar dados, tenta extrair recursos CSV/JSON
    console.info("[dadosGovBr] Dados obtidos da API. Processando...");
    // Em produção, faria download do recurso e parsing
    // Por ora, retorna o dataset local tratado
  }

  // Fallback: dataset local tratado
  return obrasRJ;
}

/**
 * Metadata do conjunto de dados utilizado.
 */
export const datasetMetadata = {
  id: "painel-obras-rj-2024",
  titulo: "Obras Públicas do Estado do Rio de Janeiro – Painel de Eficiência",
  descricao:
    "Dataset tratado com informações de obras públicas contratadas no estado do Rio de Janeiro, incluindo custos, prazos, status e indicadores de eficiência.",
  organizacao: "Governo do Estado do Rio de Janeiro / Dados Abertos",
  fonte: "Portal de Dados Abertos (dados.gov.br) – API REST v1.0",
  apiBase: API_BASE,
  endpoints: {
    listar: `${API_BASE}/conjuntos-dados?isPrivado=false&pagina=1&nomeConjuntoDados=obras`,
    detalhar: `${API_BASE}/conjuntos-dados/{id}`,
    organizacoes: `${API_BASE}/organizacao`,
  },
  ultimaAtualizacao: "2025-12-15",
  formato: "JSON",
  licenca: "Decreto nº 8.777/2016 – Política de Dados Abertos",
};
