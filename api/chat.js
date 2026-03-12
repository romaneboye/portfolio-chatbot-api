// api/chat.js — Vercel Serverless Function
// Ce fichier va dans le dossier /api/ de ton projet Vercel

export default async function handler(req, res) {
  // Autoriser les requêtes depuis ton portfolio GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*'); // Remplace * par ton URL : https://tonpseudo.github.io
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Répondre aux preflight CORS
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message manquant' });

  // ============================================================
  // ✏️ PERSONALISE TON CONTEXTE ICI
  // C'est ce que Claude connaît de toi — sois précise !
  // ============================================================
  const FAQ_CONTEXT = `
Tu es l'assistante IA du portfolio de Romane Boyé.
Réponds uniquement en te basant sur les informations ci-dessous.
Si une question dépasse ce contexte, dis poliment que tu ne peux pas y répondre
et invite le visiteur à contacter directement [TON PRÉNOM] par email.
Réponds toujours en français, avec un ton professionnel mais chaleureux.
Sois concise (3-5 phrases max par réponse).

--- PROFIL ---
Nom : Romane Boyé
Localisation : Ile-de-France, France
Email : romane.boye@gmail.com
LinkedIn : https://www.linkedin.com/in/romane-boye/

--- EXPERTISE ---
Domaines principaux :
- Marketing digital : stratégie de contenu, SEO/SEA, social media, retail media
- Data Analytics : analyse de données, dashboards, KPIs, reporting
- Intelligence Artificielle : prompting, exercice en autonomie, A/B test

Outils maîtrisés : canva, excel expert, meta ads, google ads, google tag manager, suite adobe, suite office, python, html et css, qlik, profitero, google analytics, kolsquare, IA : Copilot, claude, chat gpt.

--- EXPÉRIENCES ---
Online excellence manager — Philips France (Septembre 2025 - Aujourd'hui)
→ gestion des pages produits auprès des principaux distributeurs français
→ responsable de la stratégie rating and reviews 

Chargée de social media et influence — Générale Pour l'Enfant (2024 - 2025)
→ elaboration du planning editorial
→ sourcing d'influenceu.r.se

--- PROJETS ---
Création de ce site web portfolio : site web fait en html et css avec uniquement des bases de compréhension et la génération du code par l'IA
Création d'un chatboat : générer grâce à un bon prompting IA

--- FORMATION ---
Master Digital Marketing and Data Analytics — Double diplome EMLV et IIM (2025-2027)
Google Ads, Google Analytics, Google Tag Manager, Excel Expert, Data Ads 

--- DISPONIBILITÉ ---
Disponible pour des projets IA
Préférence : remote 
  `;
  // ============================================================

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Définie dans les variables d'env Vercel
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: FAQ_CONTEXT,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      res.status(200).json({ reply: data.content[0].text });
    } else {
      console.error('Erreur API Claude:', data);
      res.status(500).json({ error: 'Erreur de réponse IA' });
    }

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
