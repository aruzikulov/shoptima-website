// netlify/edge-functions/language-redirect.js

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
    
    // Check for Accept-Language header only if no user preference exists
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0]);
      
      // Check for Russian
      if (languages.some(lang => lang.startsWith('ru'))) {
        return Response.redirect(`${url.origin}/ru${url.pathname}`, 302);
      }
      
      // Check for Uzbek
      if (languages.some(lang => lang.startsWith('uz'))) {
        return Response.redirect(`${url.origin}/uz${url.pathname}`, 302);
      }
    }
    
    // Default to English (no redirect needed)
    return;
  };
  
  export const config = {
    path: '/*'
  };