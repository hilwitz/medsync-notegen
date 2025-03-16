
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request parameters
    const { noteType, patientInfo, symptoms, medicalHistory } = await req.json();

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing Gemini API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct prompt based on note type
    let prompt = '';
    
    switch (noteType) {
      case 'SOAP':
        prompt = `Generate a comprehensive SOAP medical note based on the following information:
        Patient: ${patientInfo || 'No patient information provided'}
        Chief Complaint: ${symptoms || 'No symptoms provided'}
        Medical History: ${medicalHistory || 'No medical history provided'}
        
        The SOAP note should include:
        - Subjective: detailed patient history, symptoms, and complaints
        - Objective: physical examination findings, vital signs, and test results
        - Assessment: diagnosis or differential diagnoses based on the information provided
        - Plan: recommended treatment, medications, follow-up, and patient education
        
        Please format the note professionally as a medical document, using appropriate medical terminology.`;
        break;

      case 'H&P':
        prompt = `Generate a detailed History and Physical (H&P) medical note based on the following information:
        Patient: ${patientInfo || 'No patient information provided'}
        Chief Complaint: ${symptoms || 'No symptoms provided'}
        Medical History: ${medicalHistory || 'No medical history provided'}
        
        The H&P note should include:
        - Chief Complaint (CC)
        - History of Present Illness (HPI)
        - Past Medical History (PMH)
        - Medications
        - Allergies
        - Family History
        - Social History
        - Review of Systems (ROS)
        - Physical Examination
        - Assessment and Plan
        
        Please format the note professionally as a medical document, using appropriate medical terminology.`;
        break;

      case 'Progress':
        prompt = `Generate a detailed Progress medical note based on the following information:
        Patient: ${patientInfo || 'No patient information provided'}
        Current Status: ${symptoms || 'No current status provided'}
        Past Information: ${medicalHistory || 'No past information provided'}
        
        The Progress note should include:
        - Current status updates
        - Changes in symptoms
        - Response to treatments
        - New findings
        - Updated assessments
        - Changes to care plan
        
        Please format the note professionally as a medical document, using appropriate medical terminology.`;
        break;

      default:
        prompt = `Generate a comprehensive medical note for ${noteType} based on the following information:
        Patient: ${patientInfo || 'No patient information provided'}
        Chief Complaint: ${symptoms || 'No symptoms provided'}
        Medical History: ${medicalHistory || 'No medical history provided'}
        
        Please format the note professionally as a medical document, using appropriate medical terminology.`;
    }

    // Call Gemini API with the correct model (gemini-2.0-flash)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    // Check for errors in the Gemini API response
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error.message || 'Error generating content with Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse generated content
    const generatedContent = data.candidates[0].content.parts[0].text;

    // Return the generated note
    return new Response(
      JSON.stringify({ 
        note: generatedContent,
        noteType: noteType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in write-with-gemini function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
