const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

const docsDir = path.join(__dirname, '../documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// ==========================================
// 1. GENERATE POWERPOINT PRESENTATION (.pptx)
// ==========================================
async function generatePowerPoint() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'INDUXIA Corp.';
  pptx.company = 'INDUXIA - Industrial AI & Resilience Platform';
  pptx.title = 'INDUXIA - Dossier Exécutif Investisseurs & Dirigeants';

  const C_DARK_BG = '0F172A';     // Slate 950
  const C_SURFACE = '1E293B';     // Slate 800
  const C_CARD = '1E293B';
  const C_ROSE = 'E11D48';        // Rose 600
  const C_ROSE_LIGHT = 'FDA4AF';
  const C_EMERALD = '10B981';     // Emerald 500
  const C_AMBER = 'F59E0B';       // Amber 500
  const C_TEXT = 'F8FAFC';        // Slate 50
  const C_MUTED = '94A3B8';       // Slate 400
  const C_BORDER = '334155';

  // SLIDE 1 : COVER
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('INDUXIA V1.4 — INDUSTRIAL AI & RESILIENCE', {
      x: 1.0,
      y: 1.8,
      w: 11.3,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: C_ROSE,
      bold: true,
      charSpacing: 2,
    });

    slide.addText("La Première Plateforme d'IA Locale Souveraine pour l'Industrie Manufacturière", {
      x: 1.0,
      y: 2.4,
      w: 11.3,
      h: 1.6,
      fontSize: 32,
      fontFace: 'Arial',
      color: C_TEXT,
      bold: true,
    });

    slide.addText('Élimination des arrêts non planifiés · Éco-efficience énergétique ISO 50001 · Accélération AMD ROCm sur site', {
      x: 1.0,
      y: 4.1,
      w: 11.0,
      h: 0.8,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_MUTED,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 1.0,
      y: 5.4,
      w: 11.3,
      h: 1.2,
      fill: { color: '182234' },
      line: { color: C_ROSE, width: 1 },
    });

    slide.addText([
      { text: 'DOSSIER STRATÉGIQUE RÉSERVÉ AUX DIRIGEANTS & INVESTISSEURS\n', options: { bold: true, color: C_ROSE_LIGHT, fontSize: 11 } },
      { text: 'Levée de Fonds Série A : 2,5 M€ | Déploiement Usines 2026-2028 | Confidentialité Stricte', options: { color: C_TEXT, fontSize: 13 } }
    ], { x: 1.3, y: 5.6, w: 10.7, h: 0.8 });
  }

  // SLIDE 2 : LE DÉFI INDUSTRIEL (LE PROBLÈME)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('01. LE DÉFI INDUSTRIEL', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Les Arrêts Non Planifiés : Hémorragie Financière des Usines', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const stats = [
      { num: '40 h/an', label: 'Arrêts critiques non planifiés par usine', sub: 'Coût horaire moyen : 15 000 € à 50 000 €' },
      { num: '750 k€', label: 'Perte annuelle moyenne par site de production', sub: 'Rebuts matières, pénalités et heures supplémentaires' },
      { num: '8% à 12%', label: 'Gaspillage d’énergie électrique non détecté', sub: 'Surconsommation frictionnelle des roulements dégradés' },
    ];

    stats.forEach((st, i) => {
      const x = 1.0 + i * 3.9;
      slide.addShape(pptx.ShapeType.rect, { x, y: 2.2, w: 3.6, h: 2.8, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
      slide.addText(st.num, { x: x + 0.3, y: 2.5, w: 3.0, h: 0.8, fontSize: 32, bold: true, color: C_ROSE });
      slide.addText(st.label, { x: x + 0.3, y: 3.4, w: 3.0, h: 0.7, fontSize: 14, bold: true, color: C_TEXT });
      slide.addText(st.sub, { x: x + 0.3, y: 4.1, w: 3.0, h: 0.7, fontSize: 11, color: C_MUTED });
    });

    slide.addText('Source : Études VDMA, Deloitte Smart Factory & benchmarks réels de maintenance usine 2025/2026', {
      x: 1.0, y: 6.2, w: 11.0, h: 0.4, fontSize: 10, color: C_MUTED, italic: true
    });
  }

  // SLIDE 3 : LA SOLUTION INDUXIA
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('02. LA SOLUTION INDUXIA', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('L’Intelligence Artificielle Souveraine au Cœur de l’Atelier', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const pillars = [
      { title: '1. IA Locale AMD ROCm', desc: 'Inférence locale déconnectée sur stations d’atelier. Zéro dépendance au cloud, zéro fuite de données de fabrication.' },
      { title: '2. RAG Industriel Certifié', desc: 'Raisonnement ancré sur les normes (ISO 10816, ISO 13374) et les manuels constructeurs OEM. Zéro hallucination.' },
      { title: '3. Human-in-the-Loop', desc: 'Contrat strict OBSERVE + PROPOSE. Aucune commande d’arrêt ou de modification de consigne sans validation superviseur.' },
    ];

    pillars.forEach((p, idx) => {
      const y = 2.0 + idx * 1.5;
      slide.addShape(pptx.ShapeType.rect, { x: 1.0, y, w: 11.3, h: 1.25, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
      slide.addText(p.title, { x: 1.3, y: y + 0.15, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: C_EMERALD });
      slide.addText(p.desc, { x: 1.3, y: y + 0.55, w: 10.5, h: 0.55, fontSize: 12, color: C_TEXT });
    });
  }

  // SLIDE 4 : COURBE DE DÉGRADATION & PRONOSTIC RUL (COURBE / CHART)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('03. PRONOSTIC TECHNIQUE AVANCÉ', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Calcul de RUL (Remaining Useful Life) & Simulateur « What-If »', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    // Native Line Chart
    const chartData = [
      {
        name: 'Sans intervention (100% vitesse)',
        labels: ['H0', 'H4', 'H8', 'H12', 'H16', 'H18.5', 'H24', 'H48', 'H72', 'H96', 'H112'],
        values: [100, 88, 72, 54, 30, 0, null, null, null, null, null],
      },
      {
        name: 'Scénario INDUXIA (-25% vitesse + Graisse SKF)',
        labels: ['H0', 'H4', 'H8', 'H12', 'H16', 'H18.5', 'H24', 'H48', 'H72', 'H96', 'H112'],
        values: [100, 96, 92, 88, 84, 82, 78, 64, 50, 36, 12],
      },
    ];

    slide.addChart(pptx.ChartType.line, chartData, {
      x: 1.0,
      y: 2.0,
      w: 7.2,
      h: 4.5,
      showLegend: true,
      legendPos: 'b',
      legendColor: C_TEXT,
      chartColors: [C_ROSE, C_EMERALD],
      lineSize: 3,
      valAxisTitle: 'Intégrité Mécanique Palier (%)',
      catAxisTitle: 'Temps d’Usinage Écoulé (Heures)',
      titleColor: C_TEXT,
      valAxisLabelColor: C_MUTED,
      catAxisLabelColor: C_MUTED,
    });

    // Side explanation card
    slide.addShape(pptx.ShapeType.rect, { x: 8.5, y: 2.0, w: 3.8, h: 4.5, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
    slide.addText('Impact Décisionnel Chef d’Atelier', { x: 8.8, y: 2.3, w: 3.2, h: 0.4, fontSize: 14, bold: true, color: C_TEXT });
    slide.addText([
      { text: '• Baseline Sans Action : ', options: { bold: true, color: C_ROSE } },
      { text: 'Rupture brutale à H18.5 en plein quart de nuit. Arrêt usine non programmé.\n\n', options: { color: C_TEXT } },
      { text: '• Recommandation INDUXIA : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Réduction de 25% de l’avance et regraissage sous pression SKF LGHP 2.\n\n', options: { color: C_TEXT } },
      { text: '• Résultat Obtenu : ', options: { bold: true, color: C_TEXT } },
      { text: 'La machine tient jusqu’à ', options: { color: C_TEXT } },
      { text: '112 heures ', options: { bold: true, color: C_EMERALD } },
      { text: '(arrêt programmé de samedi matin atteint avec 50 pièces/h produites).', options: { color: C_TEXT } }
    ], { x: 8.8, y: 2.8, w: 3.2, h: 3.4, fontSize: 11 });
  }

  // SLIDE 5 : BILAN ÉNERGÉTIQUE & ISO 50001 (BAR CHART)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('04. PERFORMANCE ÉNERGÉTIQUE (ISO 50001 & CSRD)', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Détection des Pertes Électriques Induites par les Frottements', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const energyChartData = [
      {
        name: 'Puissance Nominale Utile (kW)',
        labels: ['Broche CNC-04', 'Presse HP-12', 'Turbine TG-02', 'Robot KUKA-R7'],
        values: [14.2, 110.5, 182.0, 11.8],
      },
      {
        name: 'Surconsommation Frottement (kW)',
        labels: ['Broche CNC-04', 'Presse HP-12', 'Turbine TG-02', 'Robot KUKA-R7'],
        values: [4.2, 1.5, 3.0, 0.4],
      },
    ];

    slide.addChart(pptx.ChartType.bar, energyChartData, {
      x: 1.0,
      y: 2.0,
      w: 7.2,
      h: 4.5,
      showLegend: true,
      legendPos: 'b',
      legendColor: C_TEXT,
      chartColors: [C_EMERALD, C_ROSE],
      valAxisTitle: 'Puissance Électrique (kW)',
      titleColor: C_TEXT,
      valAxisLabelColor: C_MUTED,
      catAxisLabelColor: C_MUTED,
    });

    // Side stats
    slide.addShape(pptx.ShapeType.rect, { x: 8.5, y: 2.0, w: 3.8, h: 4.5, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
    slide.addText('Gains Énergétiques Usine', { x: 8.8, y: 2.3, w: 3.2, h: 0.4, fontSize: 14, bold: true, color: C_TEXT });
    slide.addText([
      { text: '+29,6% de Surcoût Électrique\n', options: { bold: true, color: C_ROSE, fontSize: 14 } },
      { text: 'Mesuré sur la broche CNC-04 dégradée (5.82 mm/s RMS).\n\n', options: { color: C_TEXT, fontSize: 11 } },
      { text: '87,50 € / Jour Gaspillés\n', options: { bold: true, color: C_AMBER, fontSize: 14 } },
      { text: 'Sur une seule machine non optimisée.\n\n', options: { color: C_TEXT, fontSize: 11 } },
      { text: '11,2 kg CO₂ / Heure Évitables\n', options: { bold: true, color: C_EMERALD, fontSize: 14 } },
      { text: 'Reporting instantané pour la directive européenne CSRD et audit ISO 50001.', options: { color: C_TEXT, fontSize: 11 } }
    ], { x: 8.8, y: 2.8, w: 3.2, h: 3.4 });
  }

  // SLIDE 6 : MATRICE CONCURRENTIELLE (TABLEAU)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('05. POSITIONNEMENT CONCURRENTIEL', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Pourquoi INDUXIA Surpasse les Offres Existant sur le Marché', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const tableData = [
      [
        { text: 'Critère Industriel', options: { bold: true, fill: '334155', color: C_TEXT } },
        { text: 'INDUXIA V1.4-V2.0', options: { bold: true, fill: C_ROSE, color: C_TEXT } },
        { text: 'Solutions Cloud (AWS/Azure)', options: { bold: true, fill: '1E293B', color: C_MUTED } },
        { text: 'GMAO Traditionnelles', options: { bold: true, fill: '1E293B', color: C_MUTED } },
      ],
      [
        { text: 'Souveraineté des données' },
        { text: '100% Locale / Déconnectée', options: { bold: true, color: C_EMERALD } },
        { text: 'Fuite cloud / Dépendant Web', options: { color: C_ROSE } },
        { text: 'Locale sans IA' },
      ],
      [
        { text: 'Accélération matérielle' },
        { text: 'AMD ROCm optimisé Edge', options: { bold: true, color: C_EMERALD } },
        { text: 'GPU Datacenter coûteux' },
        { text: 'Aucune' },
      ],
      [
        { text: 'Garantie Zéro Hallucination' },
        { text: 'Strict RAG ISO / SOP', options: { bold: true, color: C_EMERALD } },
        { text: 'Risque d’hallucination générique', options: { color: C_ROSE } },
        { text: 'Pas de LLM' },
      ],
      [
        { text: 'Human-in-the-Loop strict' },
        { text: 'Validation obligatoire', options: { bold: true, color: C_EMERALD } },
        { text: 'Boîte noire opaque' },
        { text: 'Manuel' },
      ],
      [
        { text: 'Corrélation ISO 50001 / kWh' },
        { text: 'Temps réel automatique', options: { bold: true, color: C_EMERALD } },
        { text: 'Modules tiers complexes' },
        { text: 'Inexistante' },
      ],
    ];

    slide.addTable(tableData, {
      x: 1.0,
      y: 2.0,
      w: 11.3,
      h: 4.5,
      border: { pt: 1, color: C_BORDER },
      fill: C_SURFACE,
      color: C_TEXT,
      fontSize: 11,
      align: 'left',
      valign: 'middle',
    });
  }

  // SLIDE 7 : BUSINESS CASE & ROI CLIENT
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('06. RENTABILITÉ & BUSINESS CASE CLIENT', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Un Retour sur Investissement Inférieur à 4 Mois pour l’Usine', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const roiTable = [
      [
        { text: 'Poste de Valeur Économique', options: { bold: true, fill: '334155', color: C_TEXT } },
        { text: 'Avant INDUXIA', options: { bold: true, fill: '1E293B', color: C_MUTED } },
        { text: 'Avec INDUXIA V1.4+', options: { bold: true, fill: '1E293B', color: C_EMERALD } },
        { text: 'Gain Net Annuel (€)', options: { bold: true, fill: C_ROSE, color: C_TEXT } },
      ],
      [
        { text: 'Évitement arrêts non planifiés (40h/an)' },
        { text: '600 000 € de pertes' },
        { text: '< 4h/an (-90% d’arrêts)' },
        { text: '+540 000 €', options: { bold: true, color: C_EMERALD } },
      ],
      [
        { text: 'Économie d’énergie frottements (kWh)' },
        { text: 'Surconsommation 8%' },
        { text: 'Détection en < 4 heures' },
        { text: '+45 000 €', options: { bold: true, color: C_EMERALD } },
      ],
      [
        { text: 'Allongement durée de vie broches' },
        { text: 'Casse prématurée' },
        { text: '+25% de durée utile' },
        { text: '+65 000 €', options: { bold: true, color: C_EMERALD } },
      ],
      [
        { text: 'Productivité techniciens (GMAO auto)' },
        { text: '1.5h de saisie/jour' },
        { text: 'ODT pré-remplis' },
        { text: '+40 000 €', options: { bold: true, color: C_EMERALD } },
      ],
      [
        { text: 'TOTAL DES GAINS PAR USINE (25 MACHINES)', options: { bold: true, fill: '182234' } },
        { text: '—', options: { fill: '182234' } },
        { text: '—', options: { fill: '182234' } },
        { text: '+690 000 € / an', options: { bold: true, fill: '182234', color: C_EMERALD, fontSize: 13 } },
      ],
    ];

    slide.addTable(roiTable, {
      x: 1.0,
      y: 2.0,
      w: 11.3,
      h: 4.2,
      border: { pt: 1, color: C_BORDER },
      fill: C_SURFACE,
      color: C_TEXT,
      fontSize: 11,
      align: 'left',
      valign: 'middle',
    });

    slide.addText('Coût de souscription annuel moyen : 60 000 € par usine  ➔  Multiplicateur de valeur x11,5 pour le client', {
      x: 1.0, y: 6.4, w: 11.3, h: 0.4, fontSize: 12, bold: true, color: C_EMERALD
    });
  }

  // SLIDE 8 : PROJECTIONS FINANCIÈRES ARR (CHART)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('07. MODÈLE ÉCONOMIQUE & TRAJECTOIRE ARR', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Une Croissance Prévisible Portée par le Modèle SaaS B2B Industriel', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const arrChartData = [
      {
        name: 'ARR (Revenu Récurrent Annuel en M€)',
        labels: ['2026 (Pilotes)', '2027 (Déploiement)', '2028 (Scale Europe)', '2029 (Global)'],
        values: [0.8, 2.6, 6.8, 15.2],
      },
    ];

    slide.addChart(pptx.ChartType.bar, arrChartData, {
      x: 1.0,
      y: 2.0,
      w: 7.2,
      h: 4.5,
      showLegend: true,
      legendPos: 'b',
      legendColor: C_TEXT,
      chartColors: [C_ROSE],
      valAxisTitle: 'ARR (Millions d’Euros)',
      titleColor: C_TEXT,
      valAxisLabelColor: C_MUTED,
      catAxisLabelColor: C_MUTED,
    });

    slide.addShape(pptx.ShapeType.rect, { x: 8.5, y: 2.0, w: 3.8, h: 4.5, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
    slide.addText('Métriques Clés & Unit Economics', { x: 8.8, y: 2.3, w: 3.2, h: 0.4, fontSize: 14, bold: true, color: C_TEXT });
    slide.addText([
      { text: '• ACV Moyen : ', options: { bold: true, color: C_TEXT } },
      { text: '60 000 € / an par usine.\n\n', options: { color: C_EMERALD } },
      { text: '• Marge Brute Logiciel : ', options: { bold: true, color: C_TEXT } },
      { text: '> 82% (Grâce au calcul Edge local sans coût d’inférence API cloud).\n\n', options: { color: C_EMERALD } },
      { text: '• Net Revenue Retention : ', options: { bold: true, color: C_TEXT } },
      { text: '> 125% (Extension naturelle d’une ligne pilote à l’ensemble du parc).\n\n', options: { color: C_EMERALD } },
      { text: '• Objectif 2029 : ', options: { bold: true, color: C_TEXT } },
      { text: '190 usines équipées en Europe et Amérique du Nord.', options: { color: C_TEXT } }
    ], { x: 8.8, y: 2.8, w: 3.2, h: 3.4, fontSize: 11 });
  }

  // SLIDE 9 : LEVÉE DE FONDS & ASK
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    slide.addText('08. OPPORTUNITÉ D’INVESTISSEMENT', { x: 1.0, y: 0.6, w: 11.0, h: 0.4, fontSize: 12, color: C_ROSE, bold: true });
    slide.addText('Levée de Fonds Série A : 2,5 Millions d’Euros', { x: 1.0, y: 1.0, w: 11.0, h: 0.7, fontSize: 24, color: C_TEXT, bold: true });

    const allocation = [
      { pct: '40%', title: 'Déploiement Commercial & Sales', desc: 'Recrutement de 6 ingénieurs d’affaires industriels pour accélérer en France, Allemagne et Benelux.' },
      { pct: '35%', title: 'R&D Moteur ROCm & Vision V2.0', desc: 'Finalisation des connecteurs temps réel OPC-UA et intégration des modèles de vision thermique FLIR.' },
      { pct: '15%', title: 'Partenariats Hardware OEM', desc: 'Validation conjointe et certification avec constructeurs de machines et intégrateurs AMD.' },
      { pct: '10%', title: 'Conformité & Sécurité NIS 2', desc: 'Certification IEC 62443 SL-3 pour sécuriser les marchés critiques (Défense, Nucléaire).' },
    ];

    allocation.forEach((al, i) => {
      const y = 2.0 + i * 1.15;
      slide.addShape(pptx.ShapeType.rect, { x: 1.0, y, w: 11.3, h: 1.0, fill: { color: C_SURFACE }, line: { color: C_BORDER, width: 1 } });
      slide.addText(al.pct, { x: 1.2, y: y + 0.15, w: 1.2, h: 0.7, fontSize: 22, bold: true, color: C_ROSE });
      slide.addText(al.title, { x: 2.5, y: y + 0.15, w: 4.5, h: 0.35, fontSize: 13, bold: true, color: C_TEXT });
      slide.addText(al.desc, { x: 2.5, y: y + 0.5, w: 9.5, h: 0.45, fontSize: 10.5, color: C_MUTED });
    });

    slide.addText('Contact Dirigeant : contact@induxia-industry.com | Démonstration interactive disponible sur http://localhost:3000', {
      x: 1.0, y: 6.5, w: 11.3, h: 0.4, fontSize: 11, bold: true, color: C_TEXT, align: 'center'
    });
  }

  const pptxPath = path.join(docsDir, 'INDUXIA_Presentation_Investisseurs_et_Dirigeants.pptx');
  await pptx.writeFile({ fileName: pptxPath });
  console.log('✅ PowerPoint generated successfully:', pptxPath);
}

// ==========================================
// 2. GENERATE WORD EXECUTIVE DOSSIER (.docx)
// ==========================================
async function generateWordDoc() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // TITRE PRINCIPAL
          new Paragraph({
            text: 'INDUXIA V1.4 — INDUSTRIAL AI & RESILIENCE',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: "Dossier Exécutif Stratégique pour Dirigeants d'Entreprises et Investisseurs",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: 'Moteur d’IA Locale Souveraine Compatible AMD ROCm & Résilience Usine du Futur (V1.5 - V2.0)',
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
          }),

          // SECTION 1
          new Paragraph({
            text: '1. Synthèse Exécutive & Thèse d’Investissement',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "L'industrie manufacturière mondiale subit des pertes annuelles colossales liées aux arrêts de production non planifiés. Dans une usine type de 25 machines de haute précision (fraiseuses CNC, presses hydrauliques, turbines), chaque arrêt de ligne coûte entre 15 000 € et 50 000 € par heure en pièces rebutées, retards de livraison et pénalités contractuelles. À ce fléau s'ajoute l'envolée des coûts énergétiques et l'exigence de conformité aux normes ISO 50001 et à la directive européenne CSRD.",
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: "INDUXIA V1.4 apporte une rupture technologique majeure : le premier système d'intelligence artificielle locale souveraine accéléré sur station de travail par puces AMD ROCm, fonctionnant 100% sur site et déconnecté de tout cloud extérieur. Le système garantit l'absence totale d'hallucination via un RAG industriel normé (ISO 10816, ISO 13374) et impose une validation humaine stricte (Human-in-the-Loop) avant toute modification de paramètre sur un équipement.",
            spacing: { after: 200 },
          }),

          // TABLEAU 1: ROI CLIENT
          new Paragraph({
            text: 'Tableau 1 : Modèle Économique & Gains Annuels par Usine (25 Machines)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Poste d’Économie Réelle' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Situation Avant INDUXIA' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Impact INDUXIA V1.4-V2.0' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: 'Gain Net (€ / An)' })], shading: { fill: 'E11D48', type: ShadingType.CLEAR } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Arrêts critiques non planifiés' })] }),
                  new TableCell({ children: [new Paragraph({ text: '40 heures de panne par an' })] }),
                  new TableCell({ children: [new Paragraph({ text: '< 4 heures/an (-90% d’arrêts)' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+540 000 €' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Gaspillage d’énergie frictionnelle (kWh)' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+8% à 12% surconsommation' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Correction sous 4 heures' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+45 000 €' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Allongement durée de vie broches' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Casse prématurée' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+25% de durée de service' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+65 000 €' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Productivité techniciens de maintenance' })] }),
                  new TableCell({ children: [new Paragraph({ text: '1.5h de saisie manuelle / jour' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'ODT pré-remplis dans SAP PM' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+40 000 €' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'TOTAL DES GAINS NETS ANNUELS' })], shading: { fill: '1E293B', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '—' })], shading: { fill: '1E293B', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '—' })], shading: { fill: '1E293B', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '+690 000 € / an' })], shading: { fill: '10B981', type: ShadingType.CLEAR } }),
                ],
              }),
            ],
          }),

          // SECTION 2
          new Paragraph({
            text: '2. L’Architecture Technologique & la Souveraineté AMD ROCm',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "Contrairement aux solutions basées sur des API Cloud publiques (AWS, OpenAI, Azure) qui imposent d'exporter la télémétrie confidentielle de l'usine et facturent chaque token d'inférence, INDUXIA exploite des stations d'atelier équipées de cartes AMD Radeon™ (RX 7900 XTX, Pro W7900) ou AMD Instinct™ (MI210, MI300X).",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "Grâce à la suite logicielle AMD ROCm / HIP, le modèle d'inférence local (Qwen 2.5 7B ou Llama 3.1 8B quantifié) s'exécute avec une latence de 50 ms et un débit dépassant 35 tokens par seconde, sans la moindre dépendance à une connexion Internet externe. La conformité avec les réglementations de cybersécurité industrielle (Directive NIS 2 et norme IEC 62443 niveau SL-3) est native.",
            spacing: { after: 200 },
          }),

          // SECTION 3
          new Paragraph({
            text: '3. Trajectoire d’Évolution & Usine du Futur (V1.5 → V2.0)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "• INDUXIA V1.5 (Court terme - 3 à 6 mois) : Déploiement de la passerelle de bus de terrain universelle OPC-UA et MQTT Sparkplug B pour une interconnexion directe aux automates Siemens S7-1500 et Beckhoff TwinCAT. Module d'éco-efficience énergétique ISO 50001 corrélant les frottements mécaniques avec la surconsommation en kWh.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• INDUXIA V1.6 (Moyen terme - 6 à 12 mois) : Calcul du RUL (Remaining Useful Life) permettant d'anticiper la rupture d'un composant critique en heures d'usinage. Simulateur « What-If » permettant au chef d'atelier d'arbitrer entre cadence de fabrication et préservation machine. Boucle fermée avec les logiciels de GMAO (SAP PM, IBM Maximo) pour la réservation automatique des pièces de rechange.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• INDUXIA V2.0 (Long terme - 12 à 18 mois) : IA multimodale embarquée sur GPU AMD couplant le LLM à l'analyse thermographique infrarouge (caméras FLIR) et compagnon vocal mains-libres en atelier (Whisper local quantifié).",
            spacing: { after: 200 },
          }),

          // TABLEAU 2: PROJECTIONS FINANCIÈRES
          new Paragraph({
            text: 'Tableau 2 : Projections Financières & Trajectoire de Croissance (2026 - 2029)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Indicateur Financier' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '2026 (Pilotes)' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '2027 (Déploiement)' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '2028 (Scale)' })], shading: { fill: '0F172A', type: ShadingType.CLEAR } }),
                  new TableCell({ children: [new Paragraph({ text: '2029 (Leader)' })], shading: { fill: 'E11D48', type: ShadingType.CLEAR } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Nombre d’usines déployées' })] }),
                  new TableCell({ children: [new Paragraph({ text: '8 sites' })] }),
                  new TableCell({ children: [new Paragraph({ text: '32 sites' })] }),
                  new TableCell({ children: [new Paragraph({ text: '85 sites' })] }),
                  new TableCell({ children: [new Paragraph({ text: '190 sites' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Revenu Récurrent Annuel (ARR)' })] }),
                  new TableCell({ children: [new Paragraph({ text: '0,8 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '2,6 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '6,8 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '15,2 M€' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Marge Brute Logicielle' })] }),
                  new TableCell({ children: [new Paragraph({ text: '78%' })] }),
                  new TableCell({ children: [new Paragraph({ text: '82%' })] }),
                  new TableCell({ children: [new Paragraph({ text: '84%' })] }),
                  new TableCell({ children: [new Paragraph({ text: '85%' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'EBITDA' })] }),
                  new TableCell({ children: [new Paragraph({ text: '-0,6 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+0,2 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+2,1 M€' })] }),
                  new TableCell({ children: [new Paragraph({ text: '+5,8 M€' })] }),
                ],
              }),
            ],
          }),

          // SECTION 4
          new Paragraph({
            text: '4. Demande de Financement & Utilisation des Fonds',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "INDUXIA recherche un investissement de 2,5 millions d'euros pour accélérer sa commercialisation en France, en Allemagne et au Benelux, et finaliser ses partenariats stratégiques avec les fabricants de machines-outils et AMD. L'utilisation des fonds est ventilée comme suit :",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• 40% (1,0 M€) : Équipe commerciale et avant-vente industrielle pour l'acquisition de 32 usines en 18 mois.\n• 35% (0,875 M€) : R&D ingénierie logicielle ROCm, connecteurs temps réel OPC-UA et modules de pronostic RUL.\n• 15% (0,375 M€) : Certification de compatibilité constructeurs et bancs de test matériels AMD.\n• 10% (0,25 M€) : Homologation cybersécurité IEC 62443 et certifications de sécurité d'atelier.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'Document établi le 7 octobre 2026 par la Direction Générale d’INDUXIA.',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300 },
          }),
        ],
      },
    ],
  });

  const docxPath = path.join(docsDir, 'INDUXIA_Dossier_Investisseurs_et_Dirigeants.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log('✅ Word document generated successfully:', docxPath);
}

async function main() {
  await generatePowerPoint();
  await generateWordDoc();
  console.log('🎉 Tous les documents exécutifs Word et PowerPoint ont été générés avec succès.');
}

main().catch((err) => {
  console.error('❌ Error generating documents:', err);
  process.exit(1);
});
