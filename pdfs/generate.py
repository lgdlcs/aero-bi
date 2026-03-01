#!/usr/bin/env python3
"""Generate branded Aero-Bi inscription PDFs"""
import weasyprint
import os

OUTDIR = os.path.dirname(__file__)
LOGO_PATH = os.path.join(os.path.dirname(__file__), '..', 'images', 'logo.png')
LOGO_URI = f"file://{os.path.abspath(LOGO_PATH)}"

BASE_CSS = """
@page {
  size: A4;
  margin: 20mm 20mm 25mm 20mm;
  @bottom-center {
    content: "Aero-Bi · K-loo · 06 26 35 48 06 · aero-bi@hotmail.fr · Morzine-Avoriaz (74)";
    font-size: 8px;
    color: #888;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
}
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 11px;
  color: #222;
  line-height: 1.5;
}
.header {
  text-align: center;
  border-bottom: 3px solid #FF6D00;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.header img {
  height: 60px;
  margin-bottom: 8px;
}
.header h1 {
  font-size: 20px;
  color: #FF6D00;
  margin: 5px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.header h2 {
  font-size: 14px;
  color: #333;
  font-weight: 400;
  margin: 3px 0;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #FF6D00;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #FF6D00;
  padding-bottom: 4px;
  margin: 20px 0 12px 0;
}
.field {
  margin: 8px 0;
  display: flex;
  align-items: baseline;
}
.field-label {
  font-weight: 600;
  min-width: 200px;
  color: #333;
}
.field-input {
  flex: 1;
  border-bottom: 1px dotted #999;
  min-height: 18px;
  padding-bottom: 2px;
}
.field-line {
  margin: 10px 0;
}
.field-line .field-input {
  display: block;
  width: 100%;
  min-height: 20px;
  border-bottom: 1px dotted #999;
  margin-top: 4px;
}
.checkbox-group {
  margin: 8px 0 8px 10px;
}
.checkbox-group label {
  display: inline-block;
  margin-right: 20px;
  font-size: 11px;
}
.checkbox {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid #FF6D00;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}
.big-field {
  margin: 8px 0;
}
.big-field .field-input {
  display: block;
  width: 100%;
  min-height: 50px;
  border: 1px dotted #999;
  border-radius: 4px;
  margin-top: 4px;
}
.signature-block {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}
.signature-box {
  width: 45%;
}
.signature-box .field-input {
  display: block;
  min-height: 60px;
  border-bottom: 1px dotted #999;
  margin-top: 4px;
}
.engagement {
  background: #FFF5EE;
  border: 1px solid #FFD4B0;
  border-radius: 6px;
  padding: 12px 15px;
  margin: 20px 0;
  font-size: 10px;
  color: #555;
}
.info-box {
  background: #F5F5F5;
  border-left: 3px solid #FF6D00;
  padding: 10px 15px;
  margin: 15px 0;
  font-size: 10px;
  color: #555;
}
.gift-banner {
  text-align: center;
  background: linear-gradient(135deg, #FF6D00, #FF9100);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}
"""

def field(label, extra=""):
    return f'<div class="field"><span class="field-label">{label}</span><span class="field-input">{extra}</span></div>'

def field_line(label):
    return f'<div class="field-line"><span class="field-label">{label}</span><span class="field-input"></span></div>'

def checkbox(options):
    html = '<div class="checkbox-group">'
    for opt in options:
        html += f'<label><span class="checkbox"></span> {opt}</label>'
    html += '</div>'
    return html

def big_field(label):
    return f'<div class="big-field"><span class="field-label">{label}</span><span class="field-input"></span></div>'

HEADER = f"""
<div class="header">
  <img src="{LOGO_URI}" alt="Aero-Bi">
  <h1>{{title}}</h1>
  <h2>{{subtitle}}</h2>
</div>
"""

PERSONAL_INFO = f"""
<div class="section-title">Informations personnelles</div>
{field("Nom :")}
{field("Prénom :")}
{field("Date de naissance :", "__ / __ / ____")}
{field("Poids :", "_______ kg")}
{field("Adresse :")}
{field("Code postal / Ville :")}
{field("Téléphone :")}
{field("Email :")}
"""

HEALTH = f"""
<div class="section-title">Santé</div>
<div class="field"><span class="field-label">Problèmes de santé à signaler :</span></div>
{checkbox(["Non", "Oui (préciser) :"])}
{field_line("")}
<div class="field"><span class="field-label">Certificat médical fourni :</span></div>
{checkbox(["Oui", "Non"])}
"""

INSURANCE = f"""
<div class="section-title">Assurance</div>
<div class="field"><span class="field-label">Licence FFVL :</span></div>
{checkbox(["Oui (n° ________________)", "Non (à souscrire sur place)"])}
"""

SIGNATURE = """
<div class="engagement">
Je soussigné(e), déclare avoir pris connaissance des conditions du stage et m'inscris à la formation organisée par Aero-Bi. Je certifie l'exactitude des informations fournies.
</div>
<div class="signature-block">
  <div class="signature-box">
    <span class="field-label">Date : __ / __ / ____</span>
  </div>
  <div class="signature-box">
    <span class="field-label">Signature :</span>
    <span class="field-input"></span>
  </div>
</div>
"""

REMARKS = f"""
<div class="section-title">Remarques</div>
{big_field("")}
"""

def make_pdf(filename, title, subtitle, body):
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{BASE_CSS}</style></head><body>
    {HEADER.replace("{title}", title).replace("{subtitle}", subtitle)}
    {body}
    </body></html>"""
    weasyprint.HTML(string=html).write_pdf(os.path.join(OUTDIR, filename))
    print(f"✓ {filename}")


# 1. Parapente Initiation
body1 = PERSONAL_INFO + f"""
<div class="section-title">Stage</div>
{field("Dates souhaitées :")}
<div class="field"><span class="field-label">Niveau actuel :</span></div>
{checkbox(["Débutant", "Quelques vols", "Autre :"])}
{big_field("Expérience parapente (vols, brevets…) :")}
<div class="info-box">
<strong>Stage 4 jours (lundi → jeudi)</strong> — 2 jours pente école + gonflage, biplace pédagogique si nécessaire, théorie élémentaire. Groupes de 2 à 6 personnes. Matériel et navettes inclus.<br>
<strong>À prévoir :</strong> repas du midi, assurance-licence FFVL, hébergement.
</div>
""" + HEALTH + INSURANCE + REMARKS + SIGNATURE

make_pdf("inscription-parapente-initiation.pdf", "Fiche d'inscription", "Stage Parapente Initiation · 4 jours", body1)


# 2. Parapente Progression
body2 = PERSONAL_INFO + f"""
<div class="section-title">Stage</div>
{field("Dates souhaitées :")}
{field("Nombre de vols estimé :")}
<div class="field"><span class="field-label">Brevet(s) FFVL :</span></div>
{checkbox(["Aucun", "Brevet initial", "Brevet de pilote", "Pilote confirmé"])}
<div class="field"><span class="field-label">Matériel personnel :</span></div>
{checkbox(["Oui (modèle : _______________)", "Non (prêt matériel école)"])}
{big_field("Objectifs du stage :")}
<div class="info-box">
<strong>À la carte</strong> — journées ou demi-journées. 35€/vol (matériel école) · 30€/vol (votre matériel). Guidage radio, découverte de nouveaux sites, validation brevets FFVL possible.<br>
<strong>À prévoir :</strong> repas, assurance-licence FFVL, hébergement.
</div>
""" + HEALTH + INSURANCE + REMARKS + SIGNATURE

make_pdf("inscription-parapente-progression.pdf", "Fiche d'inscription", "Stage Parapente Progression · À la carte", body2)


# 3. Speed Riding
body3 = PERSONAL_INFO + f"""
<div class="section-title">Stage</div>
<div class="field"><span class="field-label">Formule choisie :</span></div>
{checkbox(["Découverte · 1 demi-journée (115€)"])}
{checkbox(["Initiation 2 séances (210€)"])}
{checkbox(["Initiation 3 séances (290€)"])}
{checkbox(["Initiation 4 séances (360€)"])}
{checkbox(["Initiation 5 séances (420€)"])}
{checkbox(["Cours particulier · 1 demi-journée (240€)"])}
{field("Dates souhaitées :")}
<div class="field"><span class="field-label">Niveau ski :</span></div>
{checkbox(["Intermédiaire", "Bon", "Très bon / toutes neiges"])}
{big_field("Expérience voile / parapente :")}
<div class="info-box">
<strong>Prérequis :</strong> bon niveau ski toutes neiges.<br>
<strong>Saison :</strong> tout l'hiver, séances de 3h matin ou après-midi.
</div>
""" + HEALTH + REMARKS + SIGNATURE

make_pdf("inscription-speedriding.pdf", "Fiche d'inscription", "Stage Speed Riding", body3)


# 4. Mini-voile / Speed Flying
body4 = PERSONAL_INFO + f"""
<div class="section-title">Stage</div>
{field("Dates souhaitées :")}
{big_field("Expérience parapente / voile :")}
{field("Nombre de vols estimé :")}
<div class="field"><span class="field-label">Bonne condition physique :</span></div>
{checkbox(["Oui", "Non"])}
<div class="info-box">
<strong>Stage S.A.V. · 4 jours (lundi → jeudi)</strong> — Formation de base pour devenir pilote de mini-voile. Groupes de 2 à 5 personnes. Matériel et navettes inclus.<br>
<strong>À prévoir :</strong> repas, certificat médical, assurance FFVL, hébergement.<br>
<strong>Note :</strong> bonne forme physique requise.
</div>
""" + HEALTH + INSURANCE + REMARKS + SIGNATURE

make_pdf("inscription-minivoile.pdf", "Fiche d'inscription", "Stage Mini-voile / Speed Flying (S.A.V.) · 4 jours", body4)


# 5. Bon Cadeau
body5 = f"""
<div class="gift-banner">🎁  OFFREZ UN VOL INOUBLIABLE  🎁</div>

<div class="section-title">Acheteur</div>
{field("Nom :")}
{field("Prénom :")}
{field("Téléphone :")}
{field("Email :")}

<div class="section-title">Bénéficiaire</div>
{field("Nom :")}
{field("Prénom :")}
{field("Date de naissance :", "__ / __ / ____")}

<div class="section-title">Formule choisie</div>
{checkbox(["Baptême Classique (90€ adulte / 80€ enfant)"])}
{checkbox(["Baptême Performance (100€)"])}
{checkbox(["Baptême Sport (100€)"])}
{checkbox(["Baptême Pédagogique (100€)"])}
{checkbox(["Baptême Must (110€) ★"])}
{checkbox(["Baptême La Totale (120€)"])}
{checkbox(["Baptême Speed Riding (sur devis)"])}
{checkbox(["Autre : ________________________________________"])}

{field("Période souhaitée :")}

{big_field("Message personnel (optionnel) :")}

<div class="info-box">
<strong>Validité :</strong> 1 an à compter de la date d'achat.<br>
<strong>Sous réserve</strong> des conditions météorologiques.<br>
<strong>Bon à compléter et renvoyer</strong> par email à : aero-bi@hotmail.fr
</div>
""" + SIGNATURE

make_pdf("bon-cadeau.pdf", "Bon Cadeau", "Parapente · Speed Riding · Mini-voile · Morzine-Avoriaz", body5)

print("\n✅ 5 PDFs générés dans", OUTDIR)
