import { Activity, Clock, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";
import { getScoreColor } from "../utils/formatting";

interface KPIGridProps {
    stats: {
        total: number;
        mediaIndice: number;
        mediaCustoM2: number;
        mediaAtraso: number;
        taxaReincidencia: number;
    };
}

export function KPIGrid({ stats }: KPIGridProps) {
    return (
        <div className="kpi-grid">
            <div className="kpi-card">
                <div className="kpi-label">
                    <BarChart3 size={16} />
                    Total de Obras
                </div>
                <div className="kpi-value">{stats.total}</div>
                <div className="kpi-sub">obras analisadas no estado do RJ</div>
            </div>

            <div className="kpi-card">
                <div className="kpi-label">
                    <Activity size={16} />
                    Índice Médio
                </div>
                <div className="kpi-value" style={{ color: getScoreColor(stats.mediaIndice) }}>
                    {stats.mediaIndice}
                    <span style={{ fontSize: "1rem", fontWeight: 400 }}>/100</span>
                </div>
                <div className="kpi-sub">
                    média geral do IEOP
                </div>
            </div>

            <div className="kpi-card">
                <div className="kpi-label">
                    <DollarSign size={16} />
                    Custo Médio /m²
                </div>
                <div className="kpi-value" style={{ fontSize: "1.6rem" }}>
                    R$ {stats.mediaCustoM2.toLocaleString("pt-BR")}
                </div>
                <div className="kpi-sub">valor pago por metro quadrado</div>
            </div>

            <div className="kpi-card">
                <div className="kpi-label">
                    <Clock size={16} />
                    Atraso Médio
                </div>
                <div
                    className="kpi-value"
                    style={{ color: stats.mediaAtraso > 30 ? "#f97316" : "#22c55e" }}
                >
                    {stats.mediaAtraso}%
                </div>
                <div className="kpi-sub">em relação ao prazo contratual</div>
            </div>

            <div className="kpi-card">
                <div className="kpi-label">
                    <AlertTriangle size={16} />
                    Reincidência
                </div>
                <div
                    className="kpi-value"
                    style={{ color: stats.taxaReincidencia > 40 ? "#ef4444" : "#eab308" }}
                >
                    {stats.taxaReincidencia}%
                </div>
                <div className="kpi-sub">obras com recorrência no município</div>
            </div>
        </div>
    );
}
