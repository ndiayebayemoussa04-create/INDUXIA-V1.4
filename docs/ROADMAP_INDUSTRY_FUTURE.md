# Trajectoire Stratégique & Technique — INDUXIA Vers l'Usine du Futur (V1.5 → V2.0)

Ce document formalise l'évolution de la plateforme **INDUXIA** d'un moteur d'IA locale d'assistance (V1.4) vers le **système d'exploitation autonome de résilience industrielle**.

---

## 1. Synthèse de la Trajectoire

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ÉVOLUTION D'INDUXIA                                  │
├─────────────────┬─────────────────────────┬──────────────────────────────────────┤
│ Version         │ Thème Clé               │ Fonctionnalités Maîtresses           │
├─────────────────┼─────────────────────────┼──────────────────────────────────────┤
│ INDUXIA V1.4    │ IA Locale Souveraine    │ • Moteur ROCm / Fallback CPU         │
│ (Actuelle)      │ & Copilote RAG          │ • RAG local ISO 10816                │
│                 │                         │ • Human-in-the-Loop invariant        │
├─────────────────┼─────────────────────────┼──────────────────────────────────────┤
│ INDUXIA V1.5    │ Connectivité Terrain &  │ • Passerelle OPC-UA / Sparkplug B    │
│ (Court terme)   │ Efficience Énergétique  │ • Corrélation Vibration / kWh        │
│                 │                         │ • Audit ISO 50001 & Reporting CSRD   │
├─────────────────┼─────────────────────────┼──────────────────────────────────────┤
│ INDUXIA V1.6    │ Pronostic Avancé (RUL)  │ • Calcul Remaining Useful Life (RUL) │
│ (Moyen terme)   │ & Fermeture GMAO        │ • Simulateur d'arbitrage « What-If » │
│                 │                         │ • Passerelle SAP PM / IBM Maximo     │
├─────────────────┼─────────────────────────┼──────────────────────────────────────┤
│ INDUXIA V2.0    │ Multimodalité Locale &  │ • Thermographie FLIR + Vision ROCm   │
│ (Long terme)    │ Opérateur Augmenté      │ • Compagnon Vocal Atelier (Whisper)  │
│                 │                         │ • Cybersécurité OT (NIS 2 / IEC)     │
└─────────────────┴─────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Phase 1 : INDUXIA V1.5 — « Connectivité Terrain & Efficience Énergétique »
*Horizon : 3 à 6 mois | Objectif : Intégration usine en moins de 48h et réduction de la facture électrique.*

### A. Passerelle Universelle OPC-UA & MQTT Sparkplug B
- **Problématique industrielle** : Les usines possèdent des parcs hétérogènes (automates Siemens S7-1500, Schneider M340/M580, Beckhoff TwinCAT, Rockwell Allen-Bradley).
- **Solution technique** :
  - Client asynchrone OPC-UA embarqué (`asyncua`) capable de parcourir dynamiquement l'arborescence des balises (*NodeId browsing*).
  - Souscription aux données cycliques par MQTT avec le payload normalisé **Sparkplug B**, garantissant une compression maximale de bande passante sur réseau d'atelier.
  - Découverte automatique des équipements (*Zero-Config Asset Onboarding*).

### B. Module « Green Factory » : Corrélation Vibration / Pertes Énergétiques (ISO 50001)
- **Principe physique** : Toute dégradation mécanique (désalignement, manque de graisse, écaillage de bille) engendre une augmentation du coefficient de frottement. Cela se traduit par une surconsommation électrique mesurable au niveau du variateur de vitesse (VFD) ou du réseau triphasé.
- **Apport d'INDUXIA V1.5** :
  - Calcul dynamique de l'**Indice d'Énergie Dissipée (EDI)** :
    $$\text{EDI} = \Delta P_{\text{électrique}} - P_{\text{charge théorique}}$$
  - Conversion directe en coût d'exploitation (€/jour) et en équivalent $CO_2$ rejeté (kg $CO_2$/h).
  - Génération automatique des rapports de performance énergétique conformes aux exigences d'audit **ISO 50001** et de reporting de durabilité européen **CSRD**.

---

## 3. Phase 2 : INDUXIA V1.6 — « Pronostic Avancé (RUL) & Fermeture GMAO »
*Horizon : 6 à 12 mois | Objectif : Zéro arrêt non planifié et fin des saisies manuelles de maintenance.*

### A. Algorithme Hybride de RUL (Remaining Useful Life)
- **Limites actuelles du marché** : Les alertes classiques disent *« Vibration élevée »*, mais l'opérateur ne sait pas s'il doit arrêter la machine immédiatement ou s'il peut finir l'équipe en cours.
- **Architecture RUL INDUXIA** :
  - **Couche Physique** : Intégration de modèles de dégradation de la mécanique de la rupture (loi de Paris-Erdogan pour la propagation de fissures, loi de Weibull pour le taux de défaillance des roulements).
  - **Couche Télémétrique** : Filtre de Kalman étendu pour lisser la dérive spectrale des harmoniques de défaut (BPFO, BPFI, BSF, FTF).
  - **Pronostic Quantifié** : Estimation avec intervalle de confiance à 95% (ex: *« RUL estimé : 34 heures ± 4h à charge nominale »*).

### B. Simulateur d'Arbitrage « What-If » pour le Responsable d'Atelier
- Interface interactive permettant d'évaluer les scénarios d'exploitation :
  - *Scénario A (Maintien cadence 100%)* : Rupture estimée dans 16 heures (arrêt forcé en plein quart de nuit).
  - *Scénario B (Réduction vitesse broche -18%)* : RUL étendu à 52 heures (permet d'atteindre l'arrêt programmé du samedi matin).
  - *Scénario C (Diminution de la profondeur de passe)* : RUL étendu à 65 heures.

### C. Connecteur GMAO Bidirectionnel (SAP PM, IBM Maximo, Infor EAM)
- Dès que le superviseur valide la recommandation du Copilote :
  1. Requête automatique sur les API REST / BAPI de la GMAO pour vérifier le stock de pièces détachées (ex: référence SKF LGHP 2 et jeu de roulements).
  2. Réservation automatique de la pièce en magasin.
  3. Génération de l'Ordre de Travail (OT) planifié pour l'équipe de maintenance habilitée avec le mode opératoire (SOP) joint en PDF.

---

## 4. Phase 3 : INDUXIA V2.0 — « IA Multimodale Souveraine & Opérateur Augmenté »
*Horizon : 12 à 18 mois | Objectif : Connaissance globale de l'atelier et ergonomie mains-libres.*

### A. Vision Industrielle & Thermographie Embarquée sur GPU AMD ROCm
- Les cartes AMD Radeon™ et Instinct™ disposent d'une large bande passante mémoire (VRAM) permettant la cohabitation de modèles légers de vision et du LLM :
  - **Thermographie continue (FLIR/Hikmicro)** : Surveillance thermique infrarouge sans contact des paliers et des réducteurs. Détection précoce des gradients thermiques anormaux.
  - **Vision Qualité Zéro-Défaut** : Caméras linéaires haute vitesse pour vérifier l'état de surface des pièces finies et corréler les bavures avec l'usure de l'outil coupant.

### B. Compagnon Vocal d'Atelier Sécurisé (Whisper Local + TTS)
- **Cas d'usage** : Les techniciens de maintenance travaillent avec des gants et de l'outillage ; ils ne peuvent pas pianoter sur un clavier en cours d'intervention.
- **Moteur Vocal Local** :
  - Modèle Whisper quantifié tournant localement sur ROCm ou CPU pour la transcription en milieu bruyant.
  - Synthèse vocale fluide (Piper / Coqui) guidant pas-à-pas le technicien :
    > *Technicien : « INDUXIA, donne-moi le couple de serrage des vis du palier arrière. »*
    > *INDUXIA : « 42 Nm, en appliquant un serrage en croix selon la procédure SOP-MNT-2024. »*

### C. Cybersécurité des Réseaux Opérationnels (OT Security / Directive NIS 2)
- Analyse passive du trafic sur les bus d'atelier pour détecter les anomalies de trames SCADA/Modbus.
- Confinement strict : la machine d'inférence est **Air-Gapped** et ne communique qu'avec les passerelles validées par liste blanche (Conformité IEC 62443 niveau SL-3).

---

## 5. Modèle Économique & ROI pour l'Industrie

| Métrique de Rentabilité | Avant INDUXIA | Avec INDUXIA V1.5-V2.0 | Gain Annuel Estimé (Usine Type 25 machines) |
| :--- | :--- | :--- | :--- |
| **Arrêts non planifiés** | 42 heures/an | < 4 heures/an (-90%) | **380 000 € à 750 000 €** |
| **Surconsommation frictionnelle** | 6% à 12% des kWh moteur | Corrigée en < 4h (-8%) | **45 000 € / an** |
| **Durée de vie des outillages/broches** | Remplacement prématuré | Remplacement au point d'usure optimal (+25% durée) | **60 000 € / an** |
| **Productivité techniciens (GMAO auto)** | 1.5h de saisie par jour | 0h de saisie (Automatisé) | **35 000 € / an** |
| **Total ROI Annuel Estimé** | — | — | **520 000 € à 890 000 € / an** |
