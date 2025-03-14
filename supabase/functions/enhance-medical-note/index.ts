
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { content, noteType } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the appropriate prompt based on note type
    let prompt = '';
    if (noteType === 'SOAP') {
      prompt = `You are a medical assistant helping a healthcare provider with their SOAP note. Here's their initial note: "${content}" 
      
      Please enhance this with more medical terminology and details, maintaining the same meaning but making it more professional. If the note mentions symptoms, add some possible normal vital signs or physical examination findings. Keep the format appropriate for a SOAP note.`;
    } else if (noteType === 'H&P') {
      prompt = `You are a medical assistant helping a healthcare provider with their History & Physical. Here's their initial note: "${content}" 
      
      Please enhance this with more medical terminology and details, maintaining the same meaning but making it more professional. Focus on enhancing the history portion with relevant medical details. Keep the format appropriate for an H&P.`;
    } else {
      prompt = `You are a medical assistant helping a healthcare provider with their Progress Note. Here's their initial note: "${content}" 
      
      Please enhance this with more medical terminology and details, maintaining the same meaning but making it more professional. If the note mentions symptoms, add some possible normal vital signs or physical examination findings. Keep the format appropriate for a Progress Note.`;
    }

    // Call Google's Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": Deno.env.get("GEMINI_API_KEY") || "",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();
    
    // Extract enhanced content from the Gemini response
    const enhancedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!enhancedContent) {
      console.error("No content in Gemini response:", data);
      throw new Error("AI service returned no content");
    }

    return new Response(
      JSON.stringify({ enhancedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in enhance-medical-note function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
