/**
 * Servicio para formateo, limpieza y renderizado de textos del juego.
 */

/**
 * Corrige los caracteres corruptos con '?' provenientes de problemas de codificación en la base de datos.
 */
export function fixEncoding(text: string): string {
  if (!text) return text;
  
  return text
    // Signos de exclamación al inicio (si hay una exclamación al final o empieza la frase)
    .replace(/^\?([A-ZÁÉÍÓÚÑ])/g, '¡$1')
    .replace(/\b\?([A-ZÁÉÍÓÚÑ])/g, '¡$1')
    
    // Palabras específicas corruptas comunes en la aplicación
    .replace(/num\?rica/gi, 'numérica')
    .replace(/cu\?ntos/gi, 'cuántos')
    .replace(/cu\?nto/gi, 'cuánto')
    .replace(/introducci\?n/gi, 'introducción')
    .replace(/m\?ltiplos/gi, 'múltiplos')
    .replace(/m\?ltiplo/gi, 'múltiplo')
    .replace(/t\?rmino/gi, 'término')
    .replace(/definici\?n/gi, 'definición')
    .replace(/representaci\?n/gi, 'representación')
    .replace(/operaci\?n/gi, 'operación')
    .replace(/agrupaci\?n/gi, 'agrupación')
    .replace(/máx\?mas/gi, 'máximas')
    .replace(/f\?rmula/gi, 'fórmula')
    .replace(/b\?squeda/gi, 'búsqueda')
    .replace(/gr\?fica/gi, 'gráfica')
    .replace(/matem\?tica/gi, 'matemática')
    .replace(/b\?sica/gi, 'básica')
    .replace(/explicaci\?n/gi, 'explicación')
    .replace(/lecci\?n/gi, 'lección')
    .replace(/asociaci\?n/gi, 'asociación')
    .replace(/clasificaci\?n/gi, 'clasificación')
    .replace(/compr\?ndelo/gi, 'compréndelo')
    .replace(/pr\?ctica/gi, 'práctica')
    .replace(/teor\?a/gi, 'teoría')
    .replace(/desaf\?o/gi, 'desafío')
    .replace(/f\?cil/gi, 'fácil')
    .replace(/dif\?cil/gi, 'difícil')
    .replace(/r\?pido/gi, 'rápido')
    .replace(/l\?gica/gi, 'lógica');
}

/**
 * Convierte sintaxis básica de Markdown (imágenes y enlaces) a HTML.
 */
export function parseMarkdown(text: string): string {
  if (!text) return text;
  
  let html = text;
  
  // Parsear imágenes markdown: ![alt](url)
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  html = html.replace(imgRegex, (_match, alt, src) => {
    return `<img src="${src}" alt="${alt}" class="lk-question-graphic my-4 max-w-full rounded-xl" style="display: block; margin: 16px auto; max-height: 250px; object-fit: contain;" />`;
  });
  
  // Parsear enlaces markdown: [texto](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  html = html.replace(linkRegex, (_match, linkText, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-350">${linkText}</a>`;
  });
  
  return html;
}

/**
 * Helper principal que limpia la codificación y formatea markdown para renderizado seguro en React.
 */
export function formatContent(text: string): string {
  if (!text) return '';
  return parseMarkdown(fixEncoding(text));
}
