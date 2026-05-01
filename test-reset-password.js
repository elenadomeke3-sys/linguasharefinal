// Test resetowania hasła - uruchom w konsoli przeglądarki na stronie /auth
// lub jako skrypt Node.js z odpowiednimi zmiennymi środowiskowymi

// Test w przeglądarce:
console.log('🔍 Testowanie resetowania hasła...');

// 1. Sprawdź czy Supabase jest skonfigurowany
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('📡 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key exists:', !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key');

// 2. Test funkcji resetowania hasła
async function testPasswordReset() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabase client created');
    
    // Test resetowania hasła (podaj prawdziwy email)
    const testEmail = 'test@example.com'; // ZMIEŃ na prawdziwy email!
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('❌ Błąd resetowania hasła:', error);
      console.error('Szczegóły:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Email resetujący wysłany pomyślnie!', data);
    console.log('📧 Sprawdź skrzynkę odbiorczą (i folder SPAM)');
    return true;
    
  } catch (err) {
    console.error('❌ Błąd krytyczny:', err);
    return false;
  }
}

// Uruchom test
testPasswordReset().then(success => {
  console.log(success ? '🎉 Reset hasła działa!' : '💥 Reset hasła nie działa');
});

// 3. Sprawdź konfigurację RLS
async function checkRLSPolicies() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Sprawdź czy użytkownicy mogą się rejestrować
    console.log('🔍 Sprawdzanie polityk RLS...');
    
    // To powinno działać nawet bez logowania
    const { data, error } = await supabase.from('materials').select('count');
    
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS jest aktywny (to jest dobre!)');
    } else if (error) {
      console.log('⚠️ Inny błąd RLS:', error.message);
    } else {
      console.log('📊 Dane publiczne dostępne');
    }
    
  } catch (err) {
    console.error('Błąd sprawdzania RLS:', err);
  }
}

checkRLSPolicies();
