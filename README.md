# IEOP — Índice de Eficiência de Obras Públicas do Estado do Rio de Janeiro

## Documento de Fontes e Lógica de Construção do Índice

---

### 1. Objetivo

Apresentar um indicador quantitativo — o **IEOP (Índice de Eficiência de Obras Públicas)** — que avalia a eficiência de obras públicas no estado do Rio de Janeiro, considerando os parâmetros de **custo por metro quadrado**, **percentual de atraso** e **recorrência de obras**.

---

### 2. Fontes de Dados

| Fonte | Descrição | Utilização |
|-------|-----------|------------|
| **Portal de Dados Abertos (dados.gov.br)** | API REST v1.0 do Governo Federal para acesso a conjuntos de dados públicos | Catálogo de referência e busca de datasets sobre obras públicas |
| **Painel de Obras Gov.br** | Painel do governo federal com dados de obras e serviços de engenharia contratados | Estrutura de dados e informações de obras federais no RJ |
| **SIMEC/MEC** | Sistema Integrado de Monitoramento, Execução e Controle | Obras de infraestrutura educacional |
| **SINAPI** (Caixa Econômica Federal) | Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil | Valores de referência de custo/m² por tipo de obra |
| **CUB/RJ** (SINDUSCON-RJ) | Custo Unitário Básico da Construção Civil no RJ | Complemento aos valores de referência do SINAPI |
| **TCE-RJ** | Tribunal de Contas do Estado do Rio de Janeiro | Dados de fiscalização e acompanhamento de obras |

#### 2.1 Integração com a API dados.gov.br

O dashboard integra-se com a API REST v1.0 do Portal de Dados Abertos por meio dos seguintes endpoints:

- `GET /dados/api/publico/conjuntos-dados` — Listagem de conjuntos de dados com filtro por nome
- `GET /dados/api/publico/conjuntos-dados/{id}` — Detalhamento de um conjunto de dados
- `GET /dados/api/publico/organizacao` — Listagem de organizações publicadoras

Documentação: https://dados.gov.br/swagger-ui/index.html

> **Nota:** A API requer autenticação via Gov.br. O sistema tenta a chamada e, em caso de falha (HTTP 302 → redirect para login), utiliza o dataset local como fallback.

---

### 3. Tratamento dos Dados

#### 3.1 Coleta
Os dados foram coletados a partir de fontes públicas de obras no RJ, incluindo obras de edificação, saneamento, pavimentação, drenagem, pontes/viadutos, reformas, contenção de encostas e equipamentos públicos.

#### 3.2 Normalização
Cada obra foi padronizada com os seguintes campos:
- Identificação: ID, nome, município, tipo, órgão responsável
- Dimensões: área construída (m²)
- Custos: valor contratado e valor pago (R$)
- Prazos: datas previstas e reais de início e término
- Execução: percentuais físico e financeiro
- Controle: quantidade de aditivos, paralisações e flag de reincidência

#### 3.3 Dataset Final
- **25 obras** distribuídas em **17 municípios** do estado do Rio de Janeiro
- **8 tipos** de obra representados
- **5 status** possíveis: Concluída, Em Andamento, Paralisada, Não Iniciada, Cancelada

---

### 4. Construção do Índice (IEOP)

#### 4.1 Componentes

O IEOP é formado por 4 componentes, cada um pontuado de 0 a 100:

##### a) Custo por m² (peso: 30%)
Compara o custo real por metro quadrado com o valor de referência SINAPI/CUB para o tipo de obra.

```
ratio = custo_real_m2 / custo_referencia_m2

Se ratio ≤ 0.8  → Score = 100
Se ratio ≥ 2.0  → Score = 0
Caso contrário  → Score = 100 × (1 - (ratio - 0.8) / 1.2)
```

**Referências de custo por tipo de obra:**

| Tipo | R$/m² |
|------|-------|
| Edificação | 3.500 |
| Saneamento | 5.000 |
| Pavimentação | 450 |
| Drenagem | 2.000 |
| Ponte/Viaduto | 12.000 |
| Reforma | 2.200 |
| Contenção de Encostas | 4.500 |
| Equipamento Público | 3.000 |

##### b) Percentual de Atraso (peso: 30%)
Compara a duração real da obra com a duração originalmente prevista.

```
percentual_atraso = max(0, (dias_reais - dias_previstos) / dias_previstos × 100)

Se atraso = 0%    → Score = 100
Se atraso ≥ 100%  → Score = 0
Caso contrário    → Score = 100 × (1 - atraso / 100)
```

##### c) Recorrência (peso: 15%)
Penaliza obras que são reincidentes (obra similar no mesmo município em menos de 5 anos), que possuem paralisações ou aditivos contratuais excessivos.

```
Score = 100
Se reincidência    → Score -= 40
Por paralisação    → Score -= 10
Por aditivo        → Score -= 5
```

##### d) Execução Físico-Financeira (peso: 25%)
Avalia o alinhamento entre o percentual de execução física e o percentual de desembolso financeiro, além do desvio orçamentário.

```
desvio_exec = |percentual_fisico - percentual_financeiro|
desvio_orcamentario = (valor_pago - valor_contratado) / valor_contratado × 100

Score = 100 - desvio_exec × 1.5 - max(0, desvio_orcamentario) × 0.8
```

#### 4.2 Fórmula Final

```
IEOP = C × 0.30 + P × 0.30 + R × 0.15 + E × 0.25
```

Onde:
- **C** = Score de Custo/m² (0–100)
- **P** = Score de Prazo/Atraso (0–100)
- **R** = Score de Recorrência (0–100)
- **E** = Score de Execução (0–100)

#### 4.3 Classificação

| Faixa IEOP | Classificação |
|------------|--------------|
| 80–100 | **Ótimo** |
| 60–79 | **Bom** |
| 40–59 | **Regular** |
| 20–39 | **Ruim** |
| 0–19 | **Crítico** |

---

### 5. Justificativa dos Pesos

| Componente | Peso | Justificativa |
|-----------|------|---------------|
| Custo/m² | 30% | O gasto público deve ser otimizado. Custos muito acima da referência indicam ineficiência ou sobrepreço. |
| Atraso | 30% | Atrasos geram custos indiretos, prejudicam a população e indicam deficiência na gestão. |
| Recorrência | 15% | Obras frequentes no mesmo local indicam baixa qualidade da execução original ou planejamento deficiente. |
| Execução | 25% | Desalinhamento entre execução física e financeira indica possíveis irregularidades ou má gestão de contratos. |

---

### 6. Limitações

1. A API dados.gov.br requer autenticação gov.br para consultas, limitando acesso programático direto
2. Os custos de referência são médias e podem variar conforme complexidade e localização
3. O indicador de recorrência é binário; idealmente usaria dados georreferenciados com análise temporal
4. Obras em andamento têm o atraso calculado até a data corrente, o que pode mudar ao final

---

### 7. Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Vite
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **HTTP:** Axios
- **API:** Portal de Dados Abertos (dados.gov.br) — REST v1.0

---

### 8. Como Executar

```bash
npm install
npm run dev
```

O dashboard será aberto em `http://localhost:5173`.
