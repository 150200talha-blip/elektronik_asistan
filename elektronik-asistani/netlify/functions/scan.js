exports.handler = async (event) => {
    // CORS ayarları ve sadece POST kabulü
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const base64Image = body.image;
        const mimeType = body.mimeType || 'image/jpeg';

        // GİZLİ API ANAHTARIMIZ (Sunucunun hafızasında çalışır, tarayıcıya asla gitmez)
        const API_KEY = "AIzaSyC5WLQ59VDviuDFX0iYbfJsyhaerFOldS8";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Sen bir elektrik ve elektronik uzmanısın. Bu fotoğraftaki komponentin ne olduğunu kısa ve net bir şekilde tespit et. Tespitini iki alana ayırarak tam olarak şu JSON formatında dön: {\"type\": \"Parça Adı (Örn: NPN Transistör, Seramik Kapasitör)\", \"desc\": \"Kısa teknik açıklama, değer tahmini veya kullanım alanı.\"} . Sadece bu JSON'u dön, etrafına markdown sembolleri vs. koyma." },
                        { inlineData: { mimeType: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: data.error?.message || 'API Hatası oluştu.' }) };
        }

        const resultText = data.candidates[0].content.parts[0].text;
        
        return {
            statusCode: 200,
            headers,
            body: resultText // zaten JSON text dönmesini istedik
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Sunucu içi bir hata oluştu: " + error.message })
        };
    }
};
