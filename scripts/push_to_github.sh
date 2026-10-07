#!/usr/bin/env bash
# INDUXIA V1.4 - Script de publication vers GitHub
# Usage:
#   ./scripts/push_to_github.sh https://github.com/VOTRE_COMPTE/INDUXIA.git
#   ou
#   ./scripts/push_to_github.sh git@github.com:VOTRE_COMPTE/INDUXIA.git

set -e

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
  echo "============================================================"
  echo "  INDUXIA V1.4 — Publication vers GitHub"
  echo "============================================================"
  echo "Usage :"
  echo "  ./scripts/push_to_github.sh <URL_DU_DEPOT_GITHUB>"
  echo ""
  echo "Exemple :"
  echo "  ./scripts/push_to_github.sh https://github.com/votre-nom/induxia.git"
  echo "============================================================"
  exit 1
fi

echo ">> Configuration du remote origin : $REPO_URL"
if git remote | grep -q "origin"; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo ">> Vérification de la branche principale..."
git branch -M main

echo ">> Envoi des commits vers GitHub (main)..."
git push -u origin main

echo ""
echo "============================================================"
echo "✅ Dépôt INDUXIA V1.4 publié avec succès sur GitHub !"
echo "============================================================"
