import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image,
    HRFlowable,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Cabeçalho da página 2
        if self._pageNumber > 1:
            self.drawString(12 * mm, 287 * mm, "Tô na Bênção (TNB) • Acampamento 2026 — Manual Oficial do Voluntário")
            self.setFont("Helvetica", 8)
            self.drawRightString(198 * mm, 287 * mm, "Gincana TNB • Embaixadores do Reino")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(12 * mm, 284 * mm, 198 * mm, 284 * mm)

        # Rodapé em todas as páginas
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(12 * mm, 12 * mm, 198 * mm, 12 * mm)

        self.setFont("Helvetica", 7.5)
        self.drawString(
            12 * mm,
            8.5 * mm,
            "Igreja Bíblica da Paz (IBP) • Ministério Infantil Tô na Bênção • https://gincana-tnb.vercel.app"
        )
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(198 * mm, 8.5 * mm, page_str)
        self.restoreState()


def build_pdf():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    pdf_path = os.path.join(project_root, "docs", "GUIA_DO_VOLUNTARIO.pdf")
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    # Documento de 2 páginas exatas (Frente e Verso)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=12 * mm,
        rightMargin=12 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )

    c_primary = colors.HexColor("#0284c7")       # Azul Real TNB
    c_secondary = colors.HexColor("#78c8fb")     # Azul Celeste
    c_purple = colors.HexColor("#6d28d9")        # Roxo vibrante
    c_dark = colors.HexColor("#0f172a")          # Slate 900
    c_gray_bg = colors.HexColor("#f8fafc")       # Slate 50
    c_card_border = colors.HexColor("#e2e8f0")   # Borda suave

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=c_dark,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=5,
        spaceAfter=2,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
        spaceAfter=2,
    )

    body_bold = ParagraphStyle(
        "BodyBoldCustom",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=1,
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell_style,
        fontName="Helvetica-Bold",
    )

    table_cell_center = ParagraphStyle(
        "TableCellCenter",
        parent=table_cell_style,
        alignment=1,
    )

    story = []

    # =========================================================================
    # PÁGINA 1 — CABEÇALHO, ACESSO, EQUIPES E PROVAS REGULARES
    # =========================================================================
    logo_tnb_path = os.path.join(project_root, "public", "Logo_TNB.png")
    logo_img = None
    if os.path.exists(logo_tnb_path):
        logo_img = Image(logo_tnb_path, width=28 * mm, height=28 * mm)

    header_data = [
        [
            logo_img if logo_img else Paragraph("<b>TNB</b>", title_style),
            Paragraph(
                "<b>MANUAL OFICIAL DO VOLUNTÁRIO</b><br/>"
                "<font size=9.5 color='#0284c7'><b>App Gincana Tô na Bênção • Acampamento 2026</b></font><br/>"
                "<font size=8 color='#475569'>Tema Oficial: <i>\"Embaixadores do Reino\"</i> • Igreja Bíblica da Paz (IBP)</font>",
                title_style
            ),
            Paragraph(
                "<font size=7 color='#64748b'>VERSÃO OFICIAL</font><br/>"
                "<b>GUIA PRÁTICO</b><br/>"
                "<font size=7.5 color='#0284c7'><b>Outubro / 2026</b></font>",
                ParagraphStyle("HeadBadge", parent=title_style, fontSize=8.5, leading=11, alignment=2)
            ),
        ]
    ]

    header_table = Table(header_data, colWidths=[32 * mm, 114 * mm, 40 * mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.2, color=c_primary, spaceBefore=3, spaceAfter=4))

    # Box de Acolhimento
    welcome_text = Paragraph(
        "<b>[BEM-VINDO VOLUNTÁRIO]</b> Este manual foi preparado para dar segurança e clareza no lançamento das notas e na condução das telas do <b>Telão</b> e da <b>Cerimônia de Premiação</b>. "
        "Nosso propósito é apontar cada criança para Jesus. Seu serviço com amor, atenção e alegria faz toda a diferença!",
        callout_style
    )
    welcome_box = Table([[welcome_text]], colWidths=[186 * mm])
    welcome_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#f0f9ff")),
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#bae6fd")),
        ('LEFTPADDING', (0, 0), (0, 0), 8),
        ('RIGHTPADDING', (0, 0), (0, 0), 8),
        ('TOPPADDING', (0, 0), (0, 0), 3.5),
        ('BOTTOMPADDING', (0, 0), (0, 0), 3.5),
    ]))
    story.append(welcome_box)
    story.append(Spacer(1, 3))

    # 1. Acesso
    story.append(Paragraph("1. Como Acessar e Criar Conta na Plataforma", h1_style))
    story.append(Paragraph(
        "• <b>Endereço Oficial:</b> <b><u>https://gincana-tnb.vercel.app</u></b> (compatível com smartphone, tablet ou computador).<br/>"
        "• <b>Cadastro:</b> Na tela inicial, clique em <b>\"Criar Conta\"</b>, preencha nome completo, e-mail e crie sua senha.<br/>"
        "• <b>Liberação de Acesso:</b> Por segurança das notas das crianças, novas contas passam por aprovação rápida do Administrador.",
        body_style
    ))
    story.append(Spacer(1, 2))

    # 2. Equipes
    story.append(Paragraph("2. Equipes e Identidade Visual Oficial", h1_style))
    teams_data = [
        [
            Paragraph("<b>Equipe</b>", table_header_style),
            Paragraph("<b>Cor Hex</b>", table_header_style),
            Paragraph("<b>Visual no Sistema</b>", table_header_style),
            Paragraph("<b>Identificação Física</b>", table_header_style),
        ],
        [
            Paragraph("<font color='#d97706'>●</font> <b>AMARELA</b>", table_cell_bold),
            Paragraph("Ouro (#f59e0b)", table_cell_style),
            Paragraph("Fundo amarelo vibrante com contraste escuro", table_cell_style),
            Paragraph("Fitas e camisetas amarelas", table_cell_style),
        ],
        [
            Paragraph("<font color='#2563eb'>●</font> <b>AZUL</b>", table_cell_bold),
            Paragraph("Real (#3b82f6)", table_cell_style),
            Paragraph("Fundo azul com texto branco de alta nitidez", table_cell_style),
            Paragraph("Fitas e camisetas azuis", table_cell_style),
        ],
        [
            Paragraph("<font color='#059669'>●</font> <b>VERDE</b>", table_cell_bold),
            Paragraph("Esmeralda (#10b981)", table_cell_style),
            Paragraph("Fundo verde com texto branco brilhante", table_cell_style),
            Paragraph("Fitas e camisetas verdes", table_cell_style),
        ],
        [
            Paragraph("<font color='#64748b'>○</font> <b>BRANCO</b>", table_cell_bold),
            Paragraph("Branco (#ffffff)", table_cell_style),
            Paragraph("<b>Texto PRETO reforçado</b> com borda e sombra dupla", table_cell_style),
            Paragraph("Fitas e camisetas brancas", table_cell_style),
        ],
    ]
    teams_table = Table(teams_data, colWidths=[38 * mm, 36 * mm, 62 * mm, 50 * mm])
    teams_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_card_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_gray_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(teams_table)
    story.append(Spacer(1, 3))

    # 3. Lançando nas Provas 1 a 5
    story.append(Paragraph("3. Lançamento de Notas nas Provas Regulares (Provas 1 a 5)", h1_style))
    story.append(Paragraph(
        "As <b>Provas 1, 2, 3, 4 e 5</b> são disputadas em <b>5 baterias/rodadas obrigatórias</b> para cada uma das 4 equipes:",
        body_style
    ))

    flow_data = [
        [
            Paragraph("<b>[1] Iniciar</b><br/>Clique no botão:<br/><b>+ Lançar Pontuação</b>", table_cell_center),
            Paragraph("<b>[2] Seleção</b><br/>Escolha a <b>Prova</b><br/>e a <b>Equipe</b>", table_cell_center),
            Paragraph("<b>[3] Colocação</b><br/>Indique a colocação<br/>da equipe na rodada", table_cell_center),
            Paragraph("<b>[4] Conferência</b><br/>Verifique:<br/><b>Rodada X de 5</b>", table_cell_center),
            Paragraph("<b>[5] Salvar</b><br/>Clique em:<br/><b>Confirmar Pontuação</b>", table_cell_center),
        ]
    ]
    flow_table = Table(flow_data, colWidths=[37.2 * mm, 37.2 * mm, 37.2 * mm, 37.2 * mm, 37.2 * mm])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 0.8, c_secondary),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 2.5))

    points_data = [
        [
            Paragraph("<b>Colocação na Rodada</b>", table_header_style),
            Paragraph("<b>Pontos</b>", table_header_style),
            Paragraph("<b>Regra de Aplicação</b>", table_header_style),
        ],
        [
            Paragraph("<b>[1º Lugar]</b> Vencedor da bateria", table_cell_bold),
            Paragraph("<b>+4 pontos</b>", table_cell_center),
            Paragraph("Pontuação máxima da rodada", table_cell_style),
        ],
        [
            Paragraph("<b>[2º Lugar]</b> Segundo colocado", table_cell_bold),
            Paragraph("<b>+3 pontos</b>", table_cell_center),
            Paragraph("Segundo tempo ou chegada", table_cell_style),
        ],
        [
            Paragraph("<b>[3º Lugar]</b> Terceiro colocado", table_cell_bold),
            Paragraph("<b>+2 pontos</b>", table_cell_center),
            Paragraph("Terceiro tempo ou chegada", table_cell_style),
        ],
        [
            Paragraph("<b>[4º Lugar]</b> Quarto colocado", table_cell_bold),
            Paragraph("<b>+1 ponto</b>", table_cell_center),
            Paragraph("Participação e honra na bateria", table_cell_style),
        ],
    ]
    points_table = Table(points_data, colWidths=[65 * mm, 35 * mm, 86 * mm])
    points_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284c7")),
        ('GRID', (0, 0), (-1, -1), 0.5, c_card_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_gray_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(points_table)
    story.append(Spacer(1, 2.5))

    alert_box = Table([[
        Paragraph(
            "<b>[ASSISTENTE INTELIGENTE DE RODADAS]</b> O sistema controla a contagem de rodadas de cada equipe em tempo real. "
            "Ao registrar a 5ª rodada de um time, o sistema emite confetes e lista quais equipes ainda possuem rodadas pendentes. "
            "Tentativas de lançar uma 6ª rodada são bloqueadas para evitar duplicidade acidental.",
            callout_style
        )
    ]], colWidths=[186 * mm])
    alert_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#fef3c7")),
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#fcd34d")),
        ('LEFTPADDING', (0, 0), (0, 0), 7),
        ('RIGHTPADDING', (0, 0), (0, 0), 7),
        ('TOPPADDING', (0, 0), (0, 0), 3),
        ('BOTTOMPADDING', (0, 0), (0, 0), 3),
    ]))
    story.append(alert_box)

    # QUEBRA PARA A PÁGINA 2
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2 — CABO DE GUERRA, PROVAS ESPECIAIS, TELÃO E PREMIAÇÃO
    # =========================================================================
    story.append(Paragraph("4. Fase 2.1 — Cabo de Guerra (Tabela de Duelos)", h1_style))
    story.append(Paragraph(
        "O Cabo de Guerra é disputado na modalidade <b>todos contra todos (6 confrontos diretos)</b>:<br/>"
        "1. No menu de provas, selecione <b>\"Fase 2.1 - Cabo de Guerra\"</b> para abrir a tabela interativa.<br/>"
        "2. Os 6 duelos oficiais são: <i>Amarela × Azul</i>, <i>Amarela × Verde</i>, <i>Amarela × Branco</i>, "
        "<i>Azul × Verde</i>, <i>Azul × Branco</i> e <i>Verde × Branco</i>.<br/>"
        "3. Ao final de cada puxada, clique no botão da equipe vencedora (o sistema marcará confirmação em verde).<br/>"
        "4. A tabela calcula o ranking por vitórias e distribui a pontuação final da fase: "
        "<b>1º Lugar = 4 pts</b> | <b>2º Lugar = 3 pts</b> | <b>3º Lugar = 2 pts</b> | <b>4º Lugar = 1 pt</b>.<br/>"
        "5. Clique em <b>\"Confirmar e Salvar Pontuações do Cabo de Guerra\"</b> para persistir no placar.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5. Provas Especiais e Como Corrigir Lançamentos", h1_style))
    story.append(Paragraph(
        "• <b>Caça ao Tesouro:</b> 1º Lugar = <b>10 pts</b> | 2º Lugar = <b>8 pts</b> | 3º Lugar = <b>6 pts</b> | 4º Lugar = <b>4 pts</b>.<br/>"
        "• <b>Grito de Guerra & Melhor Fantasia:</b> Avaliação de jurados com pontuação livre (até 50 pts) e campo para observações.<br/>"
        "• <b>Como Corrigir um Lançamento Errado:</b> Na tela inicial, role até <b>\"Histórico de Pontuações\"</b>. "
        "Clique no ícone de lápis (<b>Editar</b>) para ajustar a nota ou na lixeira (<b>Excluir</b>) para remover o lançamento. "
        "O placar e o telão atualizam instantaneamente!",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("6. Operando a Tela de Projeção do Telão (/telao)", h1_style))
    story.append(Paragraph(
        "• <b>Endereço do Telão:</b> <b><u>https://gincana-tnb.vercel.app/telao</u></b> (deixar aberto no notebook conectado ao projetor/TV).<br/>"
        "• <b>Sincronização em Tempo Real:</b> O telão recebe atualizações instantâneas via WebSockets. "
        "<b>Não é necessário dar F5 ou recarregar a página</b> quando alguém lançar pontos pelo celular.<br/>"
        "• <b>Tela Cheia:</b> Clique no botão de quatro setas no topo para preencher 100% da projeção sem barras do navegador.<br/>"
        "• <b>Tema Claro / Escuro:</b> O <b>Modo Escuro</b> é o padrão (ideal para projeção). O <b>Modo Claro</b> exibe o azul oficial Tô na Bênção.<br/>"
        "• <b>Efeitos e Áudio:</b> Botões para soltar confetes manuais, tocar bateria de suspense avulsa e toca-discos vinil com a música <b>\"Mais que Vencedores\"</b>.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("7. Conduzindo a Grande Cerimônia do Resultado Final (/resultado-final)", h1_style))
    story.append(Paragraph(
        "• <b>Endereço da Cerimônia:</b> <b><u>https://gincana-tnb.vercel.app/resultado-final</u></b> (abrir no momento da revelação final).<br/>"
        "• <b>Pódio Velado com Suspense:</b> As posições começam com interrogações (<b>???</b>). O operador avança pelo botão central:",
        body_style
    ))

    ceremony_data = [
        [
            Paragraph("<b>Etapa</b>", table_header_style),
            Paragraph("<b>Botão de Ação do Operador</b>", table_header_style),
            Paragraph("<b>Bateria de Tambores</b>", table_header_style),
            Paragraph("<b>Confetes Automáticos</b>", table_header_style),
            Paragraph("<b>Revelação no Pódio</b>", table_header_style),
        ],
        [
            Paragraph("<b>PASSO 1</b>", table_cell_center),
            Paragraph("<i>Iniciar Revelação (Mostrar 4º Lugar)</i>", table_cell_bold),
            Paragraph("Toca <b>1 repetição</b>", table_cell_center),
            Paragraph("<b>4 segundos</b> contínuos", table_cell_center),
            Paragraph("Revela a Equipe 4º Lugar", table_cell_style),
        ],
        [
            Paragraph("<b>PASSO 2</b>", table_cell_center),
            Paragraph("<i>Revelar 3º Lugar (Bronze)</i>", table_cell_bold),
            Paragraph("Toca <b>2 repetições</b>", table_cell_center),
            Paragraph("<b>6 segundos</b> contínuos", table_cell_center),
            Paragraph("Revela a Medalha de Bronze", table_cell_style),
        ],
        [
            Paragraph("<b>PASSO 3</b>", table_cell_center),
            Paragraph("<i>Revelar 2º e 1º Lugares!</i>", table_cell_bold),
            Paragraph("Toca <b>4 repetições</b> (Suspense)", table_cell_center),
            Paragraph("<b>10 SEGUNDOS</b> contínuos!", table_cell_center),
            Paragraph("Revela a Prata e <b>Coroa o Campeão!</b>", table_cell_bold),
        ],
    ]
    ceremony_table = Table(ceremony_data, colWidths=[20 * mm, 54 * mm, 32 * mm, 38 * mm, 42 * mm])
    ceremony_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_purple),
        ('GRID', (0, 0), (-1, -1), 0.5, c_card_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_gray_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(ceremony_table)
    story.append(Spacer(1, 2.5))

    ceremony_alert = Table([[
        Paragraph(
            "<b>[AUTOMAÇÃO COMPLETA]</b> Não precisa controlar som ou soltar confetes manualmente! O sistema toca sozinho a quantidade exata de repetições de bateria exibindo <i>\"Rufando os Tambores...\"</i> e dispara os confetes no momento exato em que a equipe aparece. Para ensaiar antes do culto, use o botão <b>\"Reiniciar\"</b>.",
            callout_style
        )
    ]], colWidths=[186 * mm])
    ceremony_alert.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#f3e8ff")),
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#d8b4fe")),
        ('LEFTPADDING', (0, 0), (0, 0), 7),
        ('RIGHTPADDING', (0, 0), (0, 0), 7),
        ('TOPPADDING', (0, 0), (0, 0), 3),
        ('BOTTOMPADDING', (0, 0), (0, 0), 3),
    ]))
    story.append(ceremony_alert)
    story.append(Spacer(1, 3))

    # 8. Checklist do Voluntário
    story.append(Paragraph("8. Checklist do Voluntário no Dia do Acampamento", h1_style))
    chk_data = [
        [
            Paragraph("[  ] Celular carregado e conectado ao Wi-Fi do acampamento.", table_cell_style),
            Paragraph("[  ] Cabo de Guerra com duelos marcados e salvos.", table_cell_style),
        ],
        [
            Paragraph("[  ] Conta logada e aprovada com sucesso na plataforma.", table_cell_style),
            Paragraph("[  ] Notebook da projeção em Tela Cheia no link <b>/telao</b>.", table_cell_style),
        ],
        [
            Paragraph("[  ] Prova designada acompanhada com atenção às 5 rodadas.", table_cell_style),
            Paragraph("[  ] Culto de Encerramento preparado no link <b>/resultado-final</b>.", table_cell_style),
        ],
    ]
    chk_table = Table(chk_data, colWidths=[93 * mm, 93 * mm])
    chk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 3))

    # Versículo de Encerramento
    verse_text = Paragraph(
        "<i>\"Portanto, meus amados irmãos, sede firmes, inabaláveis e sempre abundantes na obra do Senhor, "
        "sabendo que, no Senhor, o vosso trabalho não é vão.\"</i> — <b>1 Coríntios 15:58</b>",
        ParagraphStyle(
            "Verse",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#1e3a8a"),
            alignment=1,
        )
    )
    verse_box = Table([[verse_text]], colWidths=[186 * mm])
    verse_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#eff6ff")),
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#93c5fd")),
        ('LEFTPADDING', (0, 0), (0, 0), 8),
        ('RIGHTPADDING', (0, 0), (0, 0), 8),
        ('TOPPADDING', (0, 0), (0, 0), 3.5),
        ('BOTTOMPADDING', (0, 0), (0, 0), 3.5),
    ]))
    story.append(verse_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF de 2 páginas gerado com sucesso em: {pdf_path}")


if __name__ == "__main__":
    build_pdf()
