import { BookOpen } from "lucide-react";

export function Methodology() {
    return (
        <div className="methodology">
            <h2>
                <BookOpen size={20} />
                Metodologia — Índice de Eficiência de Obras Públicas (IEOP)
            </h2>

            <h4>1. Fontes de Dados</h4>
            <ul>
                <li>
                    <strong>Portal de Dados Abertos (dados.gov.br)</strong> — API REST v1.0
                    (endpoint: <code>/dados/api/publico/conjuntos-dados</code>). Utilizado como
                    catálogo de referência para localização de conjuntos de dados sobre obras
                    públicas no estado do Rio de Janeiro.
                </li>
                <li>
                    <strong>Painel de Obras do Governo Federal</strong> (paineldeobras.servicos.gov.br) —
                    Base de dados de obras e serviços de engenharia contratados pelo governo federal.
                </li>
                <li>
                    <strong>SIMEC/MEC</strong> — Sistema Integrado de Monitoramento, Execução e
                    Controle do Ministério da Educação, com dados de obras de infraestrutura
                    educacional.
                </li>
                <li>
                    <strong>SINAPI</strong> (Caixa Econômica Federal) — Sistema Nacional de
                    Pesquisa de Custos e Índices da Construção Civil, usado como referência para
                    custos unitários por tipo de obra.
                </li>
                <li>
                    <strong>CUB/RJ</strong> (SINDUSCON-RJ) — Custo Unitário Básico da Construção
                    Civil no estado do Rio de Janeiro.
                </li>
            </ul>

            <h4>2. Tratamento dos Dados</h4>
            <p>
                Os dados foram coletados, normalizados e tratados para criar um dataset
                unificado com 25 obras públicas distribuídas em 17 municípios do estado do Rio
                de Janeiro. Cada obra contém informações de custo, prazo, execução física e
                financeira, aditivos contratuais, paralisações e recorrência.
            </p>
            <p>
                O serviço de integração (<code>dadosGovBr.ts</code>) realiza chamadas à API
                REST do dados.gov.br para buscar conjuntos de dados. Como a API requer
                autenticação via Gov.br para a maioria dos endpoints, o sistema utiliza um
                dataset local tratado como fallback.
            </p>

            <h4>3. Componentes do Índice</h4>
            <p>
                O IEOP é composto por quatro dimensões, cada uma com peso definido:
            </p>

            <table>
                <thead>
                    <tr>
                        <th>Componente</th>
                        <th>Peso</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Custo por m² (C)</td>
                        <td>30%</td>
                        <td>
                            Compara o custo real/m² com o valor de referência SINAPI/CUB para o tipo
                            de obra. Razão ≤ 0.8 = 100 pts; razão ≥ 2.0 = 0 pts.
                        </td>
                    </tr>
                    <tr>
                        <td>Atraso (P)</td>
                        <td>30%</td>
                        <td>
                            Percentual de atraso = (dias reais − dias previstos) / dias previstos.
                            0% de atraso = 100 pts; ≥ 100% de atraso = 0 pts.
                        </td>
                    </tr>
                    <tr>
                        <td>Recorrência (R)</td>
                        <td>15%</td>
                        <td>
                            Penaliza: reincidência (−40 pts), paralisações (−10 pts cada), aditivos
                            (−5 pts cada). Score base = 100.
                        </td>
                    </tr>
                    <tr>
                        <td>Execução (E)</td>
                        <td>25%</td>
                        <td>
                            Avalia alinhamento entre execução física e financeira. Penaliza desvio
                            (×1.5) e estouro orçamentário (×0.8).
                        </td>
                    </tr>
                </tbody>
            </table>

            <h4>4. Fórmula do Índice</h4>
            <div className="formula">
                IEOP = C × 0.30 + P × 0.30 + R × 0.15 + E × 0.25
            </div>
            <p>
                Onde cada componente varia de 0 a 100, e o resultado final também. A
                classificação final é:
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Faixa</th>
                        <th>Classificação</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>80–100</td>
                        <td style={{ color: "#22c55e" }}>Ótimo</td>
                    </tr>
                    <tr>
                        <td>60–79</td>
                        <td style={{ color: "#06b6d4" }}>Bom</td>
                    </tr>
                    <tr>
                        <td>40–59</td>
                        <td style={{ color: "#eab308" }}>Regular</td>
                    </tr>
                    <tr>
                        <td>20–39</td>
                        <td style={{ color: "#f97316" }}>Ruim</td>
                    </tr>
                    <tr>
                        <td>0–19</td>
                        <td style={{ color: "#ef4444" }}>Crítico</td>
                    </tr>
                </tbody>
            </table>

            <h4>5. Valores de Referência por Tipo de Obra (R$/m²)</h4>
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Referência (R$/m²)</th>
                        <th>Fonte</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Edificação</td><td>R$ 3.500</td><td>CUB/RJ + SINAPI</td></tr>
                    <tr><td>Saneamento</td><td>R$ 5.000</td><td>SINAPI</td></tr>
                    <tr><td>Pavimentação</td><td>R$ 450</td><td>SINAPI/DNIT</td></tr>
                    <tr><td>Drenagem</td><td>R$ 2.000</td><td>SINAPI</td></tr>
                    <tr><td>Ponte/Viaduto</td><td>R$ 12.000</td><td>SINAPI/DNIT</td></tr>
                    <tr><td>Reforma</td><td>R$ 2.200</td><td>CUB/RJ</td></tr>
                    <tr><td>Contenção de Encostas</td><td>R$ 4.500</td><td>SINAPI</td></tr>
                    <tr><td>Equipamento Público</td><td>R$ 3.000</td><td>CUB/RJ + SINAPI</td></tr>
                </tbody>
            </table>

            <h4>6. Integração com a API dados.gov.br</h4>
            <p>
                O sistema utiliza os seguintes endpoints da API REST v1.0 do Portal de Dados
                Abertos:
            </p>
            <ul>
                <li>
                    <code>GET /dados/api/publico/conjuntos-dados</code> — Lista conjuntos de dados
                    públicos com filtros por nome, organização e privacidade.
                </li>
                <li>
                    <code>GET /dados/api/publico/conjuntos-dados/&#123;id&#125;</code> — Detalha um
                    conjunto de dados específico com seus recursos (CSV, JSON etc).
                </li>
                <li>
                    <code>GET /dados/api/publico/organizacao</code> — Lista organizações publicadoras.
                </li>
            </ul>
            <p>
                A documentação completa da API está disponível em:{" "}
                <a
                    href="https://dados.gov.br/swagger-ui/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    https://dados.gov.br/swagger-ui/index.html
                </a>
            </p>

            <h4>7. Limitações</h4>
            <ul>
                <li>
                    A API dados.gov.br requer autenticação via Gov.br para consultas, o que
                    limita o acesso programático direto. O sistema utiliza um dataset local
                    tratado como fallback quando a API não está acessível.
                </li>
                <li>
                    Os custos de referência por m² são aproximações baseadas no SINAPI e CUB/RJ
                    e podem variar conforme a complexidade específica de cada obra.
                </li>
                <li>
                    O indicador de recorrência considera apenas a flag binária de reincidência.
                    Uma análise mais completa poderia incluir dados históricos georreferenciados.
                </li>
            </ul>
        </div>
    );
}
