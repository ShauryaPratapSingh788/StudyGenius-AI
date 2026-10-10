import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client securely on the server
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Rate-limiting and exponential backoff retry helper for scientific APIs
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 600
): Promise<globalThis.Response> {
  const mergedHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StudyGenius/1.0 (Academic Tool)',
    Accept: 'application/json, text/plain, */*',
    ...(options.headers as Record<string, string> || {}),
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { ...options, headers: mergedHeaders });
    if (response.ok) {
      return response;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay =
        !Number.isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `HTTP ${response.status} (${response.statusText}) from ${url}: ${errorBody.slice(0, 300)}`
    );
  }
  throw new Error(`Exhausted retries for ${url}`);
}

// Helper with graceful model fallback for high-demand spikes
// Uses standard GA and high-quota models (gemini-3.8-flash, gemini-flash-latest, gemini-3.1-flash-lite)
// to prevent 429 quota exhaustion errors from Pro preview models on standard/free tiers.
async function generateWithFallback(
  client: GoogleGenAI,
  params: any,
  preferredModel: string = 'gemini-3.8-flash'
): Promise<{ text: string; modelUsed: string; candidates?: any[] }> {
  // Replace pro preview or unsupported models with reliable flash models
  const cleanPreferred =
    preferredModel === 'gemini-3.1-pro-preview' ? 'gemini-3.8-flash' : preferredModel;

  const candidateModels = [
    cleanPreferred,
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  // Unique models to try in order
  const modelsToTry = candidateModels.filter(
    (m, i) => Boolean(m) && candidateModels.indexOf(m) === i
  );

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        ...params,
        model,
      });
      return {
        text: response.text || '',
        modelUsed: model,
        candidates: response.candidates,
      };
    } catch (err: any) {
      lastError = err;
      // Soft retry on next candidate model without flooding logs
    }
  }
  console.error('All Gemini model fallbacks exhausted:', lastError?.message || lastError);
  throw lastError;
}

// System instructions for Academic Tutor
const TUTOR_SYSTEM_INSTRUCTION = `You are StudyGenius AI, an elite college academic mentor and interactive tutor designed for university and high school students.
Your mission is to help students learn deeply, understand core principles, excel in semester exams, and retain knowledge.
Guidelines:
1. Always adapt to the requested tone (e.g. Socratic, Feynman Technique / ELI5, Exam Prep, STEM/Code Breakdown, or DeepMind Science Copilot).
2. Format answers with clear typography: use Markdown bolding, lists, LaTeX/code blocks where helpful, and concise bullet points.
3. Provide realistic college-level examples, memory hooks (mnemonics), and common exam pitfalls.
4. When discussing proteins, chemical compounds, or biology, adhere to scientific accuracy, distinguish predicted vs experimental findings, interpret AlphaFold pLDDT scores accurately (>90 Very High, 70-90 Confident, 50-70 Low, <50 Very Low), and reference PubChem/PubMed when appropriate.
5. Keep explanations engaging, encouraging, clear, and academically rigorous without being dry.`;

// API: Health & Gemini Status
app.get('/api/gemini/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey && apiKey.length > 5),
    model: 'gemini-3.8-flash',
    app: 'StudyGenius AI',
    version: '1.0.0',
  });
});

// API: Study Assistant Chatbot
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
        details: 'Please ensure your Gemini API key is set in AI Studio Secrets.',
      });
    }

    const {
      message,
      history = [],
      tutorMode = 'standard',
      subject = 'General',
      modelTier = 'general',
      useSearchGrounding = false,
      scientificContext,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    let modePrompt = '';
    switch (tutorMode) {
      case 'feynman':
        modePrompt = 'Explain using the Feynman Technique: break this down into the simplest terms possible using everyday analogies, as if teaching someone with zero background, then rebuild intuition.';
        break;
      case 'socratic':
        modePrompt = 'Use the Socratic method: guide the student by answering their question while posing 1-2 thoughtful guiding questions to test and deepen their understanding.';
        break;
      case 'exam':
        modePrompt = 'Act as an exam-focused college professor: focus on high-yield exam points, expected question formats, common mistakes students make, and key formulas/definitions.';
        break;
      case 'stem':
        modePrompt = 'Provide a step-by-step STEM breakdown: include derivations, code snippets or mathematical reasoning, edge cases, and practical examples.';
        break;
      case 'science':
        modePrompt = 'Act as an elite DeepMind Science mentor & molecular biophysicist: synthesize structural biology (AlphaFold, pLDDT scores), chemical informatics (PubChem, SMILES, functional groups), biochemical pathways, and peer-reviewed literature (PubMed citations) with rigorous accuracy and clear intuition.';
        break;
      default:
        modePrompt = 'Provide a thorough, structured, and easy-to-understand academic explanation with clear examples.';
    }

    // Determine targeted Gemini model alias based on user requested tier
    // Use gemini-3.8-flash and gemini-3.1-flash-lite for instant, high-quota, reliable responses
    let targetModel = 'gemini-3.8-flash';
    let tierPromptAddon = '';

    if (useSearchGrounding) {
      targetModel = 'gemini-3.8-flash';
    } else if (modelTier === 'fast') {
      targetModel = 'gemini-3.1-flash-lite';
      tierPromptAddon = '\n[Style: Direct, ultra-fast, high-yield summary with bullets.]';
    } else if (modelTier === 'complex') {
      targetModel = 'gemini-3.8-flash';
      tierPromptAddon = '\n[Style: Rigorous academic breakdown with key derivations and edge cases, formatted cleanly.]';
    } else {
      targetModel = 'gemini-3.8-flash';
    }

    // Format chat contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Append history (up to last 10 turns to avoid excessive context)
    const recentHistory = history.slice(-10);
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'model') {
        contents.push({
          role: h.role,
          parts: [{ text: h.content || h.text || '' }],
        });
      }
    }

    // Append scientific context grounding if provided
    let turnPrompt = `[Context: Subject: ${subject} | Tutoring Style: ${modePrompt}]${tierPromptAddon}`;
    if (scientificContext) {
      turnPrompt += `\n[Verified Scientific Grounding Data: ${scientificContext}]`;
    }
    if (useSearchGrounding) {
      turnPrompt += `\n[Live Google Search: Enabled for latest verified academic sources]`;
    }
    turnPrompt += `\n\nStudent question:\n${message}`;

    contents.push({
      role: 'user',
      parts: [{ text: turnPrompt }],
    });

    const callConfig: any = {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      temperature: modelTier === 'fast' ? 0.4 : modelTier === 'complex' ? 0.6 : 0.7,
      maxOutputTokens: modelTier === 'fast' ? 600 : 1200,
    };

    if (useSearchGrounding) {
      callConfig.tools = [{ googleSearch: {} }];
    }

    const result = await generateWithFallback(
      ai,
      {
        contents: contents,
        config: callConfig,
      },
      targetModel
    );

    const responseText = result.text || 'I could not generate an answer at this time. Please try rephrasing your question.';
    
    // Extract web search grounding sources if present
    const candidate = result.candidates?.[0];
    const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks
      .map((c: any) => ({
        title: c.web?.title || 'Web Reference',
        url: c.web?.uri || '',
      }))
      .filter((s: any) => s.url);

    return res.json({
      reply: responseText,
      modelUsed: result.modelUsed,
      searchSources,
    });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/chat:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Failed to process AI assistant response',
      details: message,
    });
  }
});

// ==========================================
// SCIENCE SKILLS API PROXY ENDPOINTS
// ==========================================

// 1. AlphaFold DB & UniProt Protein Lookup
app.get('/api/science/protein/:query', async (req: Request, res: Response) => {
  try {
    const rawQuery = req.params.query.trim();
    if (!rawQuery) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let accession = rawQuery.toUpperCase();
    let geneName = rawQuery.toUpperCase();
    let description = '';
    let organismName = 'Homo sapiens';
    let seqLength = 0;

    const CANONICAL_GENE_MAP: Record<string, string> = {
      TP53: 'P04637',
      P53: 'P04637',
      BRCA1: 'P38398',
      BRCA2: 'P51587',
      EGFR: 'P00533',
      INS: 'P01308',
      INSULIN: 'P01308',
      HBB: 'P68871',
      HEMOGLOBIN: 'P68871',
      PCSK9: 'Q8NBP7',
      CAS9: 'Q99ZW2',
      MYC: 'P01106',
      KRAS: 'P01116',
    };

    if (CANONICAL_GENE_MAP[accession]) {
      accession = CANONICAL_GENE_MAP[accession];
    }

    // Check if query is already a canonical UniProt accession
    const isAccession = /^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i.test(accession);

    if (!isAccession) {
      // Search UniProtKB for gene/protein symbol
      const uniprotSearchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(
        rawQuery + ' AND (reviewed:true)'
      )}&format=json&size=1`;
      
      const searchRes = await fetchWithRetry(uniprotSearchUrl);
      const searchData = await searchRes.json();

      if (searchData.results && searchData.results.length > 0) {
        const top = searchData.results[0];
        accession = top.primaryAccession;
        geneName = top.genes?.[0]?.geneName?.value || rawQuery;
        description = top.proteinDescription?.recommendedName?.fullName?.value || top.uniProtkbId;
        organismName = top.organism?.scientificName || 'Homo sapiens';
        seqLength = top.sequence?.length || 0;
      } else {
        // Fallback search without reviewed filter
        const fallbackUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(
          rawQuery
        )}&format=json&size=1`;
        const fbRes = await fetchWithRetry(fallbackUrl);
        const fbData = await fbRes.json();
        if (fbData.results && fbData.results.length > 0) {
          const top = fbData.results[0];
          accession = top.primaryAccession;
          geneName = top.genes?.[0]?.geneName?.value || rawQuery;
          description = top.proteinDescription?.recommendedName?.fullName?.value || top.uniProtkbId;
          organismName = top.organism?.scientificName || 'Homo sapiens';
          seqLength = top.sequence?.length || 0;
        } else {
          return res.status(404).json({ error: `No UniProt record found for "${rawQuery}"` });
        }
      }
    }

    // Now query AlphaFold DB using the accession
    const afUrl = `https://alphafold.ebi.ac.uk/api/prediction/${accession}`;
    const afRes = await fetchWithRetry(afUrl);
    const afData = await afRes.json();

    if (!Array.isArray(afData) || afData.length === 0) {
      return res.status(404).json({
        error: `No AlphaFold structure prediction found for accession ${accession}`,
      });
    }

    const model = afData[0];
    const plddtScore = Math.round(model.globalMetricValue ?? 80);
    let plddtBand: 'Very High' | 'Confident' | 'Low' | 'Very Low' = 'Confident';
    if (plddtScore >= 90) plddtBand = 'Very High';
    else if (plddtScore >= 70) plddtBand = 'Confident';
    else if (plddtScore >= 50) plddtBand = 'Low';
    else plddtBand = 'Very Low';

    const proteinPayload = {
      entryId: model.entryId,
      gene: model.gene || geneName,
      uniprotAccession: accession,
      uniprotId: model.uniprotId || accession,
      uniprotDescription: model.uniprotDescription || description || 'Macromolecular Protein',
      organism: model.organismScientificName || organismName,
      sequenceLength: (model.uniprotEnd - model.uniprotStart + 1) || seqLength || model.uniprotSequence?.length || 0,
      globalPlddt: plddtScore,
      plddtBand,
      cifUrl: model.cifUrl,
      pdbUrl: model.pdbUrl,
      paeImageUrl: model.paeImageUrl,
      paeDocUrl: model.paeDocUrl,
    };

    return res.json({ protein: proteinPayload });
  } catch (err: unknown) {
    console.error('Error in /api/science/protein:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch protein data', details: msg });
  }
});

// 2. PubChem Chemical Structure & Property Lookup
app.get('/api/science/compound/:name', async (req: Request, res: Response) => {
  try {
    const compoundName = req.params.name.trim();
    if (!compoundName) {
      return res.status(400).json({ error: 'Compound name is required' });
    }

    const pugUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
      compoundName
    )}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`;

    const pugRes = await fetchWithRetry(pugUrl);
    const pugData = await pugRes.json();

    const props = pugData?.PropertyTable?.Properties?.[0];
    if (!props) {
      return res.status(404).json({ error: `No PubChem compound found for "${compoundName}"` });
    }

    const compoundPayload = {
      cid: props.CID,
      name: compoundName,
      molecularFormula: props.MolecularFormula,
      molecularWeight: props.MolecularWeight,
      canonicalSmiles: props.CanonicalSMILES,
      inChIKey: props.InChIKey,
      xLogP: props.XLogP,
      tpsa: props.TPSA,
      hBondDonorCount: props.HBondDonorCount,
      hBondAcceptorCount: props.HBondAcceptorCount,
      complexity: props.Complexity,
      imageUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${props.CID}/PNG`,
    };

    return res.json({ compound: compoundPayload });
  } catch (err: unknown) {
    console.error('Error in /api/science/compound:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch compound data', details: msg });
  }
});

// 3. PubMed Biomedical Research Literature Search
app.get('/api/science/literature', async (req: Request, res: Response) => {
  try {
    const query = req.query.query ? String(req.query.query).trim() : 'CRISPR Cas9';

    // Step 1: ESearch to find PMIDs
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
      query
    )}&sort=pub_date&retmode=json&retmax=5`;

    const searchRes = await fetchWithRetry(esearchUrl);
    const searchData = await searchRes.json();
    const idlist: string[] = searchData?.esearchresult?.idlist || [];

    if (idlist.length === 0) {
      return res.json({ articles: [] });
    }

    // Step 2: ESummary to get article metadata
    const esummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idlist.join(
      ','
    )}&retmode=json`;

    const summaryRes = await fetchWithRetry(esummaryUrl);
    const summaryData = await summaryRes.json();
    const resultObj = summaryData?.result || {};

    const articles = idlist.map((pmid) => {
      const item = resultObj[pmid] || {};
      const doiObj = (item.articleids || []).find((a: any) => a.idtype === 'doi');
      return {
        pmid,
        title: item.title ? item.title.replace(/\[|\]/g, '') : 'Untitled Publication',
        authors: (item.authors || []).map((a: any) => a.name).slice(0, 4),
        source: item.source || 'Biomedical Journal',
        pubdate: item.pubdate || 'Recent',
        doi: doiObj?.value,
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    return res.json({ articles });
  } catch (err: unknown) {
    console.error('Error in /api/science/literature:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch literature data', details: msg });
  }
});

// API: AI Notes Generator
app.post('/api/gemini/notes', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
        details: 'Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const { subject, topic, academicLevel = 'Undergraduate', focusAreas = '' } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const prompt = `Create comprehensive, high-yield college study notes for:
Subject: ${subject}
Topic: ${topic}
Academic Level: ${academicLevel}
${focusAreas ? `Special Focus Areas: ${focusAreas}` : ''}

Generate structured JSON containing:
1. title: Clean, descriptive title
2. overview: 2-3 sentence executive summary of the concept
3. definitions: Array of core terms with precise definitions
4. keyPoints: Array of 4-7 critical concepts, principles, or formulas
5. deepDiveSections: Array of 2-4 deep dive sections, each with a heading, detailed explanation, and practical example
6. commonExamMistakes: Array of common misconceptions or exam pitfalls
7. mnemonicOrMemoryHook: A helpful mnemonic, mental model, or memory trick
8. summaryTakeaways: 3-5 bulleted rapid-review takeaways`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            deepDiveSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  content: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['heading', 'content'],
              },
            },
            commonExamMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mnemonicOrMemoryHook: { type: Type.STRING },
            summaryTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'overview',
            'definitions',
            'keyPoints',
            'deepDiveSections',
            'summaryTakeaways',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ notes: parsed });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/notes:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Failed to generate study notes',
      details: message,
    });
  }
});

// API: AI Quiz Generator
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
        details: 'Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const { subject, topic, difficulty = 'Medium', questionCount = 5, useScienceMode = false } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);

    const scienceFocus = useScienceMode
      ? `\nScience Rigor: Incorporate structural biology (AlphaFold confidence metrics, pLDDT bands: >90 Very High, 70-90 Confident, 50-70 Low, <50 Very Low), molecular informatics (PubChem properties, canonical SMILES, functional groups), or biomedical pathway mechanics.`
      : '';

    const prompt = `Generate a high quality multiple-choice academic quiz for:
Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Total Questions: ${count}${scienceFocus}

Each question must:
- Have a realistic college-level question stem testing conceptual understanding or problem solving.
- Exactly 4 options.
- The correct option index (0, 1, 2, or 3).
- A thorough explanation explaining why the correct choice is right and why distractors are incorrect.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  conceptTag: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['quizTitle', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ quiz: parsed });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/quiz:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Failed to generate quiz',
      details: message,
    });
  }
});

// API: AI Flashcards Generator
app.post('/api/gemini/flashcards', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
        details: 'Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const { subject, topic, count = 6 } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const numCards = Math.min(Math.max(Number(count) || 6, 4), 12);

    const prompt = `Generate a set of ${numCards} study flashcards for:
Subject: ${subject}
Topic: ${topic}

Each card should have:
- Front: A clear, high-impact question, term, or challenge prompt
- Back: Concise, precise, high-yield explanation or definition
- Category / Tag: Sub-topic or classification`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['deckTitle', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ flashcards: parsed });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/flashcards:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Failed to generate flashcards',
      details: message,
    });
  }
});

// API: AI Educational Diagram & Image Generator
app.post('/api/gemini/image', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
      });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enhancedPrompt = `Clear educational textbook illustration, scientific diagram, academic schematic: ${prompt}. Clean white background, high contrast, labeled components.`;

    let imageUrl = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (imgErr: unknown) {
      // If image model quota is exceeded or unavailable, render a clean academic concept schematic
      const escapedPrompt = prompt
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .slice(0, 48);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
        <rect width="600" height="600" rx="20" fill="#090d16"/>
        <circle cx="300" cy="300" r="180" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
        <circle cx="300" cy="300" r="115" stroke="#6366f1" stroke-width="2" opacity="0.8"/>
        <circle cx="300" cy="300" r="54" fill="#4338ca"/>
        <text x="300" y="305" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">CORE SYSTEM</text>
        <circle cx="300" cy="120" r="32" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="300" y="125" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">INPUT</text>
        <circle cx="480" cy="300" r="32" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
        <text x="480" y="305" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">PROCESS</text>
        <circle cx="300" cy="480" r="32" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="300" y="485" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">OUTPUT</text>
        <circle cx="120" cy="300" r="32" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <text x="120" y="305" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">FEEDBACK</text>
        <path d="M 300 152 L 300 246" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M 448 300 L 354 300" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M 300 448 L 300 354" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M 152 300 L 246 300" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
        <text x="300" y="555" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">${escapedPrompt}</text>
      </svg>`;
      imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    return res.json({ imageUrl });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/image:', err);
    const msg = err instanceof Error ? err.message : 'Failed to generate image';
    return res.status(500).json({ error: 'Image generation error', details: msg });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyGenius AI server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone HTTP server if not running in a serverless environment like Vercel
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}

export default app;
