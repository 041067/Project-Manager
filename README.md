# Atlas — Gestão de Projetos (exemplo de Teste de Aceitação)

Aplicação web estática (HTML, CSS e JavaScript puro, sem dependências) criada para demonstrar **testes de aceitação do usuário final (UAT)**. O cenário: uma agência de marketing avalia um software de gestão de projetos antes de adotá-lo oficialmente.

## Como executar

Abra o `index.html` no navegador. Não há build, servidor nem instalação. Os dados ficam no `localStorage` (chave `atlas-uat-v1`).

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura das telas e ícones SVG inline |
| `styles.css` | Estilos, cores dinâmicas por projeto/equipe/prioridade, layout responsivo |
| `app.js` | Estado, renderização, arrastar e soltar, relatórios e roteiro de aceitação |

## Telas e o que validar

1. **Projetos** — cria o projeto (ex.: "Campanha de Lançamento 2025"). Prazo, orçamento e responsável são obrigatórios; campos faltantes são destacados com mensagem de erro.
2. **Tarefas** — quadro com Backlog, Design, Conteúdo e Mídia paga. Arrastar uma tarefa entre colunas dispara um e-mail simulado (caixa de saída e painel de notificações).
3. **Progresso** — indicadores, status por projeto, horas por equipe, exportação (CSV, impressão/PDF) e integração simulada com Google Drive.
4. **Não funcionais** — medição de carregamento com simulação de rede (fibra, 4G, 3G) e exibição de dados sensíveis conforme o perfil de acesso (Gerente, Designer, Redator), selecionado na barra lateral.
5. **Roteiro de aceitação** — 10 cenários com Aprovar/Reprovar, observações, registro de problemas e exportação do resultado em CSV.

## Defeitos intencionais

O app contém problemas propositais, vindos do exemplo, para o usuário reprovar no roteiro:

- O campo **prioridade** não tem a opção **Urgente** (apenas Baixa, Média e Alta).
- O relatório de horas **não exporta para Excel (.xlsx)**; o botão exibe um erro.

## Observações

- Integração com Google Drive, e-mails e medições de rede são **simulações** locais.
- O perfil de acesso apenas oculta dados na interface; não há autenticação real.
- "Restaurar dados de exemplo" na barra lateral limpa dados e resultados do roteiro.
