import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, UtensilsCrossed } from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cachedLogo = localStorage.getItem('saydee_food_logo');
    if (cachedLogo) {
      setLogoUrl(cachedLogo);
      setLoading(false);
      return;
    }

    const generateLogo = async () => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          setError(true);
          setLoading(false);
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: "A professional and elegant logo for a food business named 'Saydee Food'. The logo should feature warm colors like orange and gold, incorporating a stylized chef's hat or a fork and spoon. Clean, modern typography. High resolution, white background, minimalist style.",
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const dataUrl = `data:image/png;base64,${base64EncodeString}`;
            setLogoUrl(dataUrl);
            localStorage.setItem('saydee_food_logo', dataUrl);
            setLoading(false);
            return;
          }
        }
        setError(true);
      } catch (err) {
        // Log the error but don't crash the app
        console.warn("Logo generation failed (likely quota). Using fallback icon.");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    generateLogo();
  }, []);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-orange-100 rounded-lg animate-pulse`}>
        <Loader2 className="text-orange-500 animate-spin" size={20} />
      </div>
    );
  }

  if (error || !logoUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-orange-500 rounded-lg text-white`}>
        <UtensilsCrossed size={24} />
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt="Saydee Food Logo" 
      className={`${className} object-contain rounded-lg`}
      referrerPolicy="no-referrer"
    />
  );
};
