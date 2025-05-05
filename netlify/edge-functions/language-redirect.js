// netlify/edge-functions/language-redirect.js

const RUSSIAN_SPEAKING_COUNTRIES = new Set([
  'RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'MD', 'UA'
]);

export default async (request, context) => {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Skip if already on a language-specific path
    if (pathname.startsWith('/ru/') || pathname.startsWith('/uz/') || pathname.startsWith('/en/')) {
      console.log('Skipping - already on language path');
      return;
    }
    
    // Skip assets and files
    if (pathname.split('/').pop().includes('.')) {
      console.log('Skipping - file asset');
      return;
    }
    
    // Check for user preference cookie
    const userSelectedLang = context.cookies.get('user_lang');
    if (userSelectedLang) {
      console.log('Skipping - user language preference exists:', userSelectedLang);
      return;
    }
    
    // Get geolocation data
    const country = context.geo?.country?.code || 'unknown';
    const isRussianSpeakingCountry = RUSSIAN_SPEAKING_COUNTRIES.has(country);
    console.log('Country detected:', country);
    
    // Analyze Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    let browserPrefersRussian = false;
    let browserPrefersUzbek = false;
    
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].toLowerCase());
      browserPrefersRussian = languages.some(lang => lang.startsWith('ru'));
      browserPrefersUzbek = languages.some(lang => lang.startsWith('uz'));
      console.log('Browser languages:', languages);
    }
    
    // Decision logic
    if (browserPrefersUzbek) {
      console.log('Redirecting to Uzbek');
      return Response.redirect(`${url.origin}/uz${pathname}`, 302);
    }
    
    if (browserPrefersRussian && isRussianSpeakingCountry) {
      console.log('Redirecting to Russian');
      return Response.redirect(`${url.origin}/ru${pathname}`, 302);
    }
    
    console.log('Defaulting to English');
    return;
    
  } catch (error) {
    console.error('Edge Function error:', error);
    return;
  }
};

export const config = {
  path: '/*'
};