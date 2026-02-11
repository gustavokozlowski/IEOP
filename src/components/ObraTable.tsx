import { useState, useMemo } from "react";
import { List, ArrowUpDown, Search } from "lucide-react";
import type  { IndiceEficiencia, TipoObra, StatusObra } from "../types/obra";
import { getClassificacaoBadge, getStatusBadge, getScoreColor } from "../utils/formatting";

interface ObraTableProps {
    indices: IndiceEficiencia[];
}

type SortKey = "indice" | "nomeObra" | "municipio" | "custoPorM2" | "percentualAtraso";

export function ObraTable({ indices }: ObraTableProps) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<StatusObra | "">("");
    const [filterTipo, setFilterTipo] = useState<TipoObra | "">("");
    const [filterClass, setFilterClass] = useState<string>("");
    const [sortKey, setSortKey] = useState<SortKey>("indice");
    const [sortAsc, setSortAsc] = useState(false);

    const filtered = useMemo(() => {
        let data = [...indices];

        if (search) {
            const q = search.toLowerCase();
            data = data.filter(
                (i) =>
                    i.nomeObra.toLowerCase().includes(q) ||
                    i.municipio.toLowerCase().includes(q)
            );
        }

        if (filterStatus) data = data.filter((i) => i.status === filterStatus);
        if (filterTipo) data = data.filter((i) => i.tipo === filterTipo);
        if (filterClass) data = data.filter((i) => i.classificacao === filterClass);

        data.sort((a, b) => {
            let va: number | string, vb: number | string;
            switch (sortKey) {
                case "indice":
                    va = a.indice;
                    vb = b.indice;
                    break;
                case "nomeObra":
                    va = a.nomeObra;
                    vb = b.nomeObra;
                    break;
                case "municipio":
                    va = a.municipio;
                    vb = b.municipio;
                    break;
                case "custoPorM2":
                    va = a.metricas.custoPorM2;
                    vb = b.metricas.custoPorM2;
                    break;
                case "percentualAtraso":
                    va = a.metricas.percentualAtraso;
                    vb = b.metricas.percentualAtraso;
                    break;
                default:
                    va = a.indice;
                    vb = b.indice;
            }
            if (typeof va === "string" && typeof vb === "string") {
                return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });

        return data;
    }, [indices, search, filterStatus, filterTipo, filterClass, sortKey, sortAsc]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortAsc(!sortAsc);
        else {
            setSortKey(key);
            setSortAsc(false);
        }
    }

    const tipos: TipoObra[] = [
        "Edificação",
        "Saneamento",
        "Pavimentação",
        "Drenagem",
        "Ponte/Viaduto",
        "Reforma",
        "Contenção de Encostas",
        "Equipamento Público",
    ];

    return (
        <div className="table-section">
            <h3>
                <List size={18} />
                Detalhamento por Obra ({filtered.length})
            </h3>

            <div className="filters">
                <div style={{ position: "relative" }}>
                    <Search
                        size={14}
                        style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#64748b",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar obra ou município..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: 32, minWidth: 220 }}
                    />
                </div>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusObra | "")}>
                    <option value="">Todos os status</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Paralisada">Paralisada</option>
                    <option value="Não Iniciada">Não Iniciada</option>
                    <option value="Cancelada">Cancelada</option>
                </select>

                <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as TipoObra | "")}>
                    <option value="">Todos os tipos</option>
                    {tipos.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>

                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                    <option value="">Todas as classificações</option>
                    <option value="Ótimo">Ótimo</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Ruim">Ruim</option>
                    <option value="Crítico">Crítico</option>
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th onClick={() => toggleSort("indice")}>
                            IEOP <ArrowUpDown size={12} />
                        </th>
                        <th>Class.</th>
                        <th onClick={() => toggleSort("nomeObra")}>
                            Obra <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => toggleSort("municipio")}>
                            Município <ArrowUpDown size={12} />
                        </th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th onClick={() => toggleSort("custoPorM2")}>
                            Custo/m² <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => toggleSort("percentualAtraso")}>
                            Atraso <ArrowUpDown size={12} />
                        </th>
                        <th>Desvio Orç.</th>
                        <th>Reinc.</th>
                        <th>Componentes</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item) => (
                        <tr key={item.obraId}>
                            <td>
                                <span
                                    className="score-gauge"
                                    style={{ color: getScoreColor(item.indice) }}
                                >
                                    <span className="progress-bar">
                                        <span
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${item.indice}%`,
                                                background: getScoreColor(item.indice),
                                            }}
                                        />
                                    </span>
                                    {item.indice}
                                </span>
                            </td>
                            <td>
                                <span className={`badge ${getClassificacaoBadge(item.classificacao)}`}>
                                    {item.classificacao}
                                </span>
                            </td>
                            <td
                                style={{
                                    maxWidth: 220,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                                title={item.nomeObra}
                            >
                                {item.nomeObra}
                            </td>
                            <td>{item.municipio}</td>
                            <td style={{ fontSize: "0.78rem" }}>{item.tipo}</td>
                            <td>
                                <span className={`badge ${getStatusBadge(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td>R$ {item.metricas.custoPorM2.toLocaleString("pt-BR")}</td>
                            <td
                                style={{
                                    color: item.metricas.percentualAtraso > 50 ? "#f97316" : "#94a3b8",
                                }}
                            >
                                {item.metricas.percentualAtraso}%
                            </td>
                            <td
                                style={{
                                    color:
                                        item.metricas.desvioOrcamentario > 10
                                            ? "#ef4444"
                                            : item.metricas.desvioOrcamentario < 0
                                                ? "#22c55e"
                                                : "#94a3b8",
                                }}
                            >
                                {item.metricas.desvioOrcamentario > 0 ? "+" : ""}
                                {item.metricas.desvioOrcamentario}%
                            </td>
                            <td>
                                {item.metricas.temReincidencia ? (
                                    <span style={{ color: "#f97316" }}>Sim</span>
                                ) : (
                                    <span style={{ color: "#64748b" }}>Não</span>
                                )}
                            </td>
                            <td style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                C:{item.componentes.custoPorM2Score} P:{item.componentes.atrasoScore}{" "}
                                R:{item.componentes.recorrenciaScore} E:{item.componentes.execucaoScore}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
