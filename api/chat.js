// api/chat.js — Vercel Serverless Function (Gemini)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message manquant' });

  const FAQ_CONTEXT = `
Tu es l'assistante IA du portfolio de Romane Boyé.
Réponds uniquement en te basant sur les informations ci-dessous.
Si une question dépasse ce contexte, dis poliment que tu ne peux pas y répondre
et invite le visiteur à contacter directement Romane par email.
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

Outils maîtrisés : Canva, Excel expert, Meta Ads, Google Ads, Google Tag Manager, Suite Adobe, Suite Office, Python, HTML et CSS, Qlik, Profitero, Google Analytics, Kolsquare, IA : Copilot, Claude, ChatGPT.

--- EXPÉRIENCES ---
Online Excellence Manager — Philips France (Septembre 2025 - Aujourd'hui)
→ Gestion des pages produits auprès des principaux distributeurs français
→ Responsable de la stratégie rating and reviews

Chargée de social media et influence — Générale Pour l'Enfant (2024 - 2025)
→ Élaboration du planning éditorial
→ Sourcing d'influenceur.se

--- PROJETS ---
Création de ce site web portfolio : site web fait en HTML et CSS avec uniquement des bases de compréhension et la génération du code par l'IA
Création d'un chatbot : généré grâce à un bon prompting IA

--- FORMATION ---
Master Digital Marketing and Data Analytics — Double diplôme EMLV et IIM (2025-2027)
Certifications : Google Ads, Google Analytics, Google Tag Manager, Excel Expert, Data Ads

--- DISPONIBILITÉ ---
Disponible pour des projets IA
Préférence : remote
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: FAQ_CONTEXT }]
          },
          contents: [
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply });
    } else {
      console.error('Erreur Gemini:', data);
      res.status(500).json({ error: 'Erreur de réponse IA' });
    }

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
