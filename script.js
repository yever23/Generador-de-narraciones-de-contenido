// Variables de estado
let selectedGenre = null;
let selectedPlatform = null;
let apiKey = localStorage.getItem('gemini_api_key') || ''; // Recupera si ya la guardó

// Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
    if (apiKey) {
        document.getElementById('apiKeyInput').value = '****************';
    }
});

// Manejo de API Key
document.getElementById('saveKeyBtn').addEventListener('click', () => {
    const input = document.getElementById('apiKeyInput');
    if (input.value && input.value !== '****************') {
        apiKey = input.value;
        localStorage.setItem('gemini_api_key', apiKey);
        alert('¡API Key guardada en tu navegador!');
        input.value = '****************';
    }
});

// Selección de botones (Género y Plataforma)
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const parent = e.target.parentElement;
        // Quitar clase active de los hermanos
        parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        // Activar el actual
        e.target.classList.add('active');
        
        // Guardar selección
        if (parent.id === 'genreGroup') selectedGenre = e.target.dataset.value;
        if (parent.id === 'platformGroup') selectedPlatform = e.target.dataset.value;
    });
});

// Función Principal: GENERAR
document.getElementById('generateBtn').addEventListener('click', async () => {
    const idea = document.getElementById('ideaInput').value;
    const outputArea = document.getElementById('resultArea');
    const storyText = document.getElementById('storyOutput');
    const btn = document.getElementById('generateBtn');

    // Validaciones
    if (!apiKey) return alert('Por favor ingresa tu API Key de Google Gemini primero.');
    if (!idea) return alert('¡Escribe una idea para la historia!');
    if (!selectedGenre || !selectedPlatform) return alert('Selecciona un género y una plataforma.');

    // UI Loading
    btn.innerText = '⏳ Cocinando historia...';
    btn.disabled = true;
    outputArea.style.display = 'none';

    try {
        // 1. Construir el Prompt (Instrucción a la IA)
        const prompt = `
            Actúa como un experto estratega de contenido viral.
            Crea contenido para la plataforma: ${selectedPlatform}.
            Género/Tono: ${selectedGenre}.
            La idea base es: "${idea}".
            
            Reglas de formato:
            - Si es TikTok/Reels: Dame un guion técnico (Escena, Diálogo, Texto en pantalla).
            - Si es Facebook/LinkedIn: Dame el texto del post con emojis y estructura de copywritting (Gancho, Cuerpo, Llamado a la acción).
            - Si es YouTube: Dame una estructura de video (Intro, Puntos clave, Outro).
            
            ¡Hazlo creativo y listo para publicar!
        `;

        // 2. Llamar a la API de Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // Verificar errores
        if (data.error) throw new Error(data.error.message);

        // 3. Mostrar Resultado
        const generatedText = data.candidates[0].content.parts[0].text;
        storyText.innerText = generatedText;
        
        // 4. Lógica de Sugerencia de IA (Hardcoded logic)
        recommendAITool(selectedPlatform, selectedGenre);

        outputArea.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert('Error al generar: ' + error.message);
    } finally {
        btn.innerText = '✨ Generar Historia';
        btn.disabled = false;
    }
});

// Función para recomendar herramienta de Video
function recommendAITool(platform, genre) {
    const suggestionBox = document.getElementById('aiToolSuggestion');
    let text = "";

    if (platform === 'TikTok' || platform === 'YouTube') {
        if (genre === 'Terror' || genre === 'Dramático') {
            text = "🔥 **Sugerencia:** Para este video visual y cinemático, usa **Runway Gen-2** o **Pika Labs** para generar los clips de video, y **ElevenLabs** para una voz narradora profunda.";
        } else if (genre === 'Educativo') {
            text = "💡 **Sugerencia:** Para contenido educativo, prueba **HeyGen** para crear un avatar que hable por ti, o **Descript** para editar el video como si fuera texto.";
        } else {
            text = "⚡ **Sugerencia:** Para viralidad rápida, usa **CapCut** (edición manual) o **InVideo AI** para que te arme el video completo con stock footage.";
        }
    } else {
        text = "🎨 **Sugerencia:** Como es texto/imagen estática, te recomiendo generar una imagen impactante con **Midjourney** o **DALL-E 3** que acompañe este texto.";
    }

    suggestionBox.innerHTML = markedText(text); // Simple format helper
}

// Pequeña ayuda para formatear negritas en la sugerencia
function markedText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function copiarTexto() {
    const text = document.getElementById('storyOutput').innerText;
    navigator.clipboard.writeText(text).then(() => alert('Texto copiado!'));
}
