
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, noteType } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Gemini API key not found')
    }

    // Create system prompt based on note type
    let systemPrompt = ""
    
    if (noteType === 'SOAP') {
      systemPrompt = `You are a medical professional assistant. Generate a complete SOAP note based on the following information from a healthcare provider. Format the response as a JSON object with 'subjective', 'objective', 'assessment', and 'plan' fields. Be detailed and professional.`
    } else if (noteType === 'H&P') {
      systemPrompt = `You are a medical professional assistant. Generate a complete History & Physical note based on the following information from a healthcare provider. Format the response as a JSON object with 'history', 'physical_exam', 'assessment', and 'plan' fields. Be detailed and professional.`
    } else {
      systemPrompt = `You are a medical professional assistant. Generate a complete Progress Note based on the following information from a healthcare provider. Format the response as a JSON object with a single 'progress_note' field. Be detailed and professional.`
    }

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      const errorMessage = data.error?.message || 'Failed to generate content with Gemini'
      throw new Error(errorMessage)
    }

    // Extract content from Gemini response
    const generatedText = data.candidates[0].content.parts[0].text

    // Try to parse it as JSON if possible
    let generatedContent
    try {
      // Remove any markdown code block notation that might be in the response
      const jsonString = generatedText.replace(/```json\n|\n```|```/g, '')
      generatedContent = jsonString
    } catch (e) {
      // If parsing fails, just use the raw text based on note type
      if (noteType === 'SOAP') {
        generatedContent = JSON.stringify({
          subjective: generatedText,
          objective: '',
          assessment: '',
          plan: ''
        })
      } else if (noteType === 'H&P') {
        generatedContent = JSON.stringify({
          history: generatedText,
          physical_exam: '',
          assessment: '',
          plan: ''
        })
      } else {
        generatedContent = JSON.stringify({
          progress_note: generatedText
        })
      }
    }

    return new Response(
      JSON.stringify({ generatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in generate-with-gemini function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
