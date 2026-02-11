import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ZAxis,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Target, Layers } from "lucide-react";
import type { IndiceEficiencia } from "../types/obra";

interface ChartsProps {
    indices: IndiceEficiencia[];
    stats: {
        porClassificacao: Record<string, number>;
        porStatus: Record<string, number>;
    };
}

const CLASSIFICACAO_COLORS: Record<string, string> = {
    Ótimo: "#22c55e",
    Bom: "#06b6d4",
    Regular: "#eab308",
    Ruim: "#f97316",
    Crítico: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
    Concluída: "#22c55e",
    "Em Andamento": "#3b82f6",
    Paralisada: "#f97316",
    "Não Iniciada": "#64748b",
    Cancelada: "#ef4444",
};

export function Charts({ indices, stats }: ChartsProps) {
    // Dados para gráfico de barras – top 10 obras por índice
    const barData = indices.slice(0, 12).map((i) => ({
        nome: i.nomeObra.length > 30 ? i.nomeObra.slice(0, 28) + "…" : i.nomeObra,
        indice: i.indice,
        fill:
            i.indice >= 80
                ? "#22c55e"
                : i.indice >= 60
                    ? "#06b6d4"
                    : i.indice >= 40
                        ? "#eab308"
                        : i.indice >= 20
                            ? "#f97316"
                            : "#ef4444",
    }));

    // Dados para pizza – classificação
    const pieClassificacao = Object.entries(stats.porClassificacao)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
            name: k,
            value: v,
            color: CLASSIFICACAO_COLORS[k],
        }));

    // Dados para pizza – status
    const pieStatus = Object.entries(stats.porStatus)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
            name: k,
            value: v,
            color: STATUS_COLORS[k],
        }));

    // Dados para radar – médias por componente
    const radarData = [
        {
            componente: "Custo/m²",
            media: Math.round(
                indices.reduce((s, i) => s + i.componentes.custoPorM2Score, 0) / indices.length
            ),
        },
        {
            componente: "Prazo",
            media: Math.round(
                indices.reduce((s, i) => s + i.componentes.atrasoScore, 0) / indices.length
            ),
        },
        {
            componente: "Recorrência",
            media: Math.round(
                indices.reduce((s, i) => s + i.componentes.recorrenciaScore, 0) / indices.length
            ),
        },
        {
            componente: "Execução",
            media: Math.round(
                indices.reduce((s, i) => s + i.componentes.execucaoScore, 0) / indices.length
            ),
        },
    ];

    // Dados para scatter – custo/m² vs atraso
    const scatterData = indices.map((i) => ({
        x: i.metricas.custoPorM2,
        y: i.metricas.percentualAtraso,
        z: i.indice,
        nome: i.nomeObra,
    }));

    return (
        <>
            {/* Linha 1: barras + classificação */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>
                        <TrendingUp size={18} />
                        Ranking de Eficiência (IEOP)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                            <YAxis
                                type="category"
                                dataKey="nome"
                                width={180}
                                stroke="#64748b"
                                fontSize={11}
                                tick={{ fill: "#94a3b8" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                }}
                                formatter={(value: number | undefined) => [`${value ?? 0}/100`, "Índice IEOP"]}
                                labelStyle={{ color: "#f1f5f9" }}
                            />
                            <Bar dataKey="indice" radius={[0, 4, 4, 0]}>
                                {barData.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>
                        <PieIcon size={18} />
                        Distribuição por Classificação
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={pieClassificacao}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={120}
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                }
                                labelLine={{ stroke: "#64748b" }}
                            >
                                {pieClassificacao.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value) => (
                                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Linha 2: radar + status + scatter */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>
                        <Target size={18} />
                        Média por Componente do Índice
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis
                                dataKey="componente"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={{ fill: "#64748b", fontSize: 10 }}
                            />
                            <Radar
                                name="Média"
                                dataKey="media"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.25}
                                strokeWidth={2}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                }}
                                formatter={(value: number | undefined) => [`${value ?? 0}/100`, "Score Médio"]}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>
                        <Layers size={18} />
                        Status das Obras
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={pieStatus}
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                                labelLine={{ stroke: "#64748b" }}
                            >
                                {pieStatus.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value) => (
                                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Linha 3: scatter custo vs atraso */}
            <div className="charts-grid">
                <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
                    <h3>
                        <Target size={18} />
                        Custo/m² × Atraso (%) — Tamanho = Índice IEOP
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Custo/m²"
                                stroke="#64748b"
                                fontSize={12}
                                label={{
                                    value: "Custo/m² (R$)",
                                    position: "insideBottom",
                                    offset: -5,
                                    fill: "#64748b",
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Atraso"
                                stroke="#64748b"
                                fontSize={12}
                                label={{
                                    value: "Atraso (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    fill: "#64748b",
                                }}
                            />
                            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Índice" />
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                }}
                                formatter={(value: number | undefined, name: string | undefined) => {
                                    const v = value ?? 0;
                                    const n = name ?? "";
                                    if (n === "Custo/m²") return [`R$ ${v.toLocaleString("pt-BR")}`, n];
                                    if (n === "Atraso") return [`${v}%`, n];
                                    return [`${v}/100`, "IEOP"];
                                }}
                                labelFormatter={() => ""}
                            />
                            <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.7} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
