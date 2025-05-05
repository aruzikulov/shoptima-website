// netlify/edge-functions/language-redirect.js

// Countries where Russian is commonly spoken
const RUSSIAN_SPEAKING_COUNTRIES = new Set([
    'RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'MD', 'UA'
  ]);
  
  export default async (request, context) => {
    const url = new URL(request.url);
    
    // Skip if already on a language-specific path
    if (url.pathname.startsWith('/ru/') || url.pathname.startsWith('/uz/') || url.pathname.startsWith('/en/')) {
      return;
    }
    
    // Skip if it's a file (like CSS, JS, images)
    if (url.pathname.split('/').pop().includes('.')) {
      return;
    }
    
    // Skip if user has explicitly changed language (has our cookie)
    const userSelectedLang = context.cookies.get('user_lang');
    if (userSelectedLang) {
      return;
    }
    
    // Get country code from geolocation
    const country = context.geo?.country?.code || '';
    const isRussianSpeakingCountry = RUSSIAN_SPEAKING_COUNTRIES.has(country);
    
    // Check for Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let browserPrefersRussian = false;
    let browserPrefersUzbek = false;
    
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0]);
      browserPrefersRussian = languages.some(lang => lang.startsWith('ru'));
      browserPrefersUzbek = languages.some(lang => lang.startsWith('uz'));
    }
    
    // Decision logic:
    // 1. Redirect to Uzbek only if browser prefers Uzbek
    if (browserPrefersUzbek) {
      return Response.redirect(`${url.origin}/uz${url.pathname}`, 302);
    }
    
    // 2. Redirect to Russian only if both:
    //    - Browser prefers Russian AND
    //    - User is in a Russian-speaking country
    if (browserPrefersRussian && isRussianSpeakingCountry) {
      return Response.redirect(`${url.origin}/ru${url.pathpathname}`, 302);
    }
    
    // Default to English (no redirect needed)
    return;
  };
  
  export const config = {
    path: '/*'
  };