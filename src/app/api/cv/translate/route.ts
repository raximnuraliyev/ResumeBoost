import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse, AI_MODELS } from '@/lib/openrouter'

// Language names for better prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
  nl: 'Dutch',
  lt: 'Lithuanian',
  uz: 'Uzbek',
  zh: 'Chinese (Simplified)',
  ko: 'Korean',
  es: 'Spanish',
  pt: 'Portuguese',
  el: 'Greek',
  uk: 'Ukrainian',
  ar: 'Arabic',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetLanguage, sourceLanguage, blocks } = body

    if (!blocks || !targetLanguage) {
      return NextResponse.json(
        { error: 'Blocks and target language are required' },
        { status: 400 }
      )
    }

    const sourceLangName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage || 'English'
    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage

    // Section title translations for built-in sections
    const SECTION_TITLES: Record<string, Record<string, string>> = {
      en: { summary: 'Professional Summary', skills: 'Technical Skills', experience: 'Experience', education: 'Education', projects: 'Projects' },
      ru: { summary: 'Профессиональное резюме', skills: 'Технические навыки', experience: 'Опыт работы', education: 'Образование', projects: 'Проекты' },
      de: { summary: 'Berufsprofil', skills: 'Technische Fähigkeiten', experience: 'Berufserfahrung', education: 'Ausbildung', projects: 'Projekte' },
      fr: { summary: 'Résumé professionnel', skills: 'Compétences techniques', experience: 'Expérience', education: 'Formation', projects: 'Projets' },
      nl: { summary: 'Professionele samenvatting', skills: 'Technische vaardigheden', experience: 'Werkervaring', education: 'Opleiding', projects: 'Projecten' },
      lt: { summary: 'Profesinė santrauka', skills: 'Techniniai įgūdžiai', experience: 'Darbo patirtis', education: 'Išsilavinimas', projects: 'Projektai' },
      uz: { summary: 'Professional xulosa', skills: 'Texnik ko\'nikmalar', experience: 'Ish tajribasi', education: 'Ta\'lim', projects: 'Loyihalar' },
      zh: { summary: '专业简介', skills: '技术技能', experience: '工作经验', education: '教育背景', projects: '项目经历' },
      ko: { summary: '전문 요약', skills: '기술 스킬', experience: '경력', education: '학력', projects: '프로젝트' },
      es: { summary: 'Resumen profesional', skills: 'Habilidades técnicas', experience: 'Experiencia', education: 'Educación', projects: 'Proyectos' },
      pt: { summary: 'Resumo profissional', skills: 'Competências técnicas', experience: 'Experiência', education: 'Formação', projects: 'Projetos' },
      el: { summary: 'Επαγγελματική περίληψη', skills: 'Τεχνικές δεξιότητες', experience: 'Εμπειρία', education: 'Εκπαίδευση', projects: 'Έργα' },
      uk: { summary: 'Професійне резюме', skills: 'Технічні навички', experience: 'Досвід роботи', education: 'Освіта', projects: 'Проекти' },
      ar: { summary: 'الملخص المهني', skills: 'المهارات التقنية', experience: 'الخبرة', education: 'التعليم', projects: 'المشاريع' },
    }

    // Simplify blocks for translation, include sectionTitle field for UI display
    const simplifiedBlocks = blocks.map((block: any) => ({
      id: block.id,
      type: block.type,
      content: block.content,
      customTitle: block.customTitle,
      sectionTitle: block.sectionTitle // Include section titles that need translation
    }))

    const prompt = `Translate this CV content from ${sourceLangName} to ${targetLangName}.

IMPORTANT RULES:
1. Keep proper names (people names, company names) unchanged
2. Keep technical terms (programming languages, frameworks, tools) unchanged
3. Translate job titles, descriptions, and general text professionally
4. Translate any customTitle fields for custom sections
5. Preserve the exact JSON structure
6. For sectionTitle, provide translated section titles if the block has one

INPUT:
${JSON.stringify(simplifiedBlocks, null, 2)}

OUTPUT: Return ONLY a valid JSON array. Example format:
[{"id":"1","type":"header","content":{"fullName":"John Doe","professionalTitle":"Translated Title"},"customTitle":null,"sectionTitle":"Translated Section Title"}]

TRANSLATE NOW:`

    try {
      const { content: aiResponse } = await generateAIResponse(
        [
          { role: 'system', content: `You are a professional translator. Translate CV content to ${targetLangName}. Return ONLY valid JSON array, nothing else.` },
          { role: 'user', content: prompt }
        ],
        AI_MODELS.DEEPSEEK_CHIMERA,
        { temperature: 0.2, max_tokens: 4000, feature: 'CV Translation' }
      )

      // Parse the AI response
      let translated
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanResponse = aiResponse
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .replace(/^[\s\S]*?(\[)/m, '[') // Remove everything before first [
          .trim()
        
        // Try to find JSON array in the response
        const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          cleanResponse = jsonMatch[0]
        }
        
        translated = JSON.parse(cleanResponse)
        
        // Validate translated blocks have required fields
        if (!Array.isArray(translated)) {
          throw new Error('Response is not an array')
        }

        // Ensure all blocks have required fields and add section titles
        translated = translated.map((block: any, idx: number) => {
          const blockType = block.type || simplifiedBlocks[idx]?.type
          // Get translated section title from predefined translations or from AI response
          const sectionTitle = SECTION_TITLES[targetLanguage]?.[blockType] || block.sectionTitle || undefined
          
          return {
            id: block.id || simplifiedBlocks[idx]?.id,
            type: blockType,
            content: block.content || simplifiedBlocks[idx]?.content,
            customTitle: block.customTitle,
            sectionTitle
          }
        })

      } catch (parseError) {
        console.error('Failed to parse AI translation response:', parseError)
        console.error('Raw response:', aiResponse.substring(0, 500))
        // Return original blocks with translated section titles if parsing fails
        const fallbackTranslated = blocks.map((block: any) => ({
          ...block,
          sectionTitle: SECTION_TITLES[targetLanguage]?.[block.type] || undefined
        }))
        return NextResponse.json({
          blocks: fallbackTranslated,
          translated: fallbackTranslated,
          sectionTitles: SECTION_TITLES[targetLanguage] || SECTION_TITLES.en,
          success: false,
          error: 'Translation parsing failed, original content returned'
        })
      }

      return NextResponse.json({
        blocks: translated,
        translated,
        sectionTitles: SECTION_TITLES[targetLanguage] || SECTION_TITLES.en,
        language: targetLanguage,
        success: true
      })
    } catch (aiError) {
      console.error('AI translation error:', aiError)
      // Return original content if AI fails
      return NextResponse.json({
        blocks: blocks,
        translated: blocks,
        success: false,
        error: 'AI translation failed, original content returned'
      })
    }
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
