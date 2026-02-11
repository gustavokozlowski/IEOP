import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { obrasRJ } from "./data/obras";
import { carregarObras, datasetMetadata } from "./services/dadosGovBr";
import { calcularIndices, calcularEstatisticas } from "./services/indiceEficiencia";
import { KPIGrid } from "./components/KPIGrid";
import { Charts } from "./components/Charts";
import { ObraTable } from "./components/ObraTable";
import { Methodology } from "./components/Methodology";
import type { Obra } from "./types/obra";

function App() {
    const [obras, setObras] = useState<Obra[]>(obrasRJ);
    const [loading, setLoading] = useState(true);
    const [fonte, setFonte] = useState<"local" | "api">("local");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const data = await carregarObras();
                if (!cancelled) {
                    setObras(data);
                    setFonte(data === obrasRJ ? "local" : "api");
                }
            } catch {
                if (!cancelled) setObras(obrasRJ);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const indices = useMemo(() => calcularIndices(obras), [obras]);
    const stats = useMemo(() => calcularEstatisticas(indices), [indices]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                <p>Carregando dados de obras públicas do RJ...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        <BarChart3 size={28} />
                        Índice de Eficiência de Obras Públicas
                        <span className="version-badge">RJ</span>
                    </h1>
                    <p>
                        Painel analítico de {stats.total} obras públicas no estado do Rio de
                        Janeiro — IEOP (Índice de Eficiência de Obras Públicas)
                    </p>
                </div>
                <div className="header-meta">
                    <div>
                        Fonte:{" "}
                        <a
                            href="https://dados.gov.br/swagger-ui/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            dados.gov.br — API REST v1.0
                        </a>
                    </div>
                    <div>Dados: {fonte === "api" ? "API" : "Dataset local tratado"}</div>
                    <div>Atualização: {datasetMetadata.ultimaAtualizacao}</div>
                </div>
            </div>

            {/* KPIs */}
            <KPIGrid stats={stats} />

            {/* Gráficos */}
            <Charts indices={indices} stats={stats} />

            {/* Tabela Detalhada */}
            <ObraTable indices={indices} />

            {/* Metodologia */}
            <Methodology />

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>
                    Dashboard IEOP — Índice de Eficiência de Obras Públicas do Estado do Rio de
                    Janeiro
                </p>
                <p>
                    API:{" "}
                    <a
                        href="https://dados.gov.br/swagger-ui/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        dados.gov.br/swagger-ui
                    </a>{" "}
                    | Referências: SINAPI, CUB/RJ, SIMEC, Painel de Obras Gov.br
                </p>
            </footer>
        </div>
    );
}

export default App;
