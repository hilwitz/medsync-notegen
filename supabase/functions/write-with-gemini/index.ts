
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
    const requestData = await req.json()
    const { noteType, patientInfo, symptoms, medicalHistory } = requestData
    
    if (!symptoms) {
      throw new Error('Patient symptoms are required')
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Gemini API key not found')
    }

    // Create prompt based on note type and patient info
    let prompt = `Create a detailed ${noteType} note for a patient with the following information:\n`
    prompt += patientInfo ? `Patient: ${patientInfo}\n` : ''
    prompt += `Symptoms: ${symptoms}\n`
    prompt += medicalHistory ? `Medical History: ${medicalHistory}\n` : ''
    
    if (noteType === 'SOAP') {
      prompt += `Format the response as a SOAP note with Subjective, Objective, Assessment, and Plan sections. Be detailed and professional.`
    } else if (noteType === 'H&P') {
      prompt += `Format the response as a History & Physical note with Chief Complaint, History of Present Illness, Past Medical History, Medications, Allergies, Family History, Social History, Review of Systems, Physical Examination, and Assessment and Plan sections. Be detailed and professional.`
    } else {
      prompt += `Format the response as a Progress Note detailing the patient's current status, interval history, and plan. Be detailed and professional.`
    }

    console.log('Sending request to Gemini API with prompt:', prompt)

    // Call Gemini API with the correct model
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Gemini API error response:', data)
      const errorMessage = data.error?.message || 'Failed to generate content with Gemini'
      throw new Error(errorMessage)
    }

    // Extract content from Gemini response
    let generatedText = ''
    
    if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
      generatedText = data.candidates[0].content.parts[0].text
    } else {
      throw new Error('Invalid response format from Gemini API')
    }

    console.log('Successfully generated note')

    return new Response(
      JSON.stringify({ note: generatedText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in write-with-gemini function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
