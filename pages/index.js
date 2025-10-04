import Head from "next/head";
import Script from "next/script";
import firebaseConfig, { APP_ID } from "../firebaseConfig";

export default function Home() {
  // Global variable __initial_auth_token disediakan oleh runtime Canvas.
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  return (
    <>
      <Head>
        <title>Sistem Pemrosesan Data OSINT V7</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:," />
        {/* Menyuntikkan konfigurasi dan token autentikasi ke window object */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.FIREBASE_CONFIG_JSON = \`${JSON.stringify(firebaseConfig)}\`;
              window.APP_ID = "${APP_ID}";
              window.INITIAL_AUTH_TOKEN = "${initialAuthToken}";
            `
          }}
        />
        
        {/* --- STYLE GLOBAL TEMA TERMINAL (Sesuai index.html Asli) --- */}
        <style dangerouslySetInnerHTML={{
            __html: `
                @import url('https://fonts.googleapis.com/css2?family=Nova+Mono&display=swap');
                
                body {
                    font-family: 'Nova Mono', monospace; /* Font konsol/terminal */
                    background-color: #000 !important; /* Latar belakang Hitam */
                    color: #0f0; /* Teks Hijau Neon */
                    overflow-x: hidden;
                }
                
                /* Efek bayangan neon untuk elemen penting */
                .shadow-neon-sm {
                    box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
                }
                .shadow-neon-lg {
                    box-shadow: 0 0 20px rgba(0, 255, 0, 0.9);
                }
                
                /* Cursor kustom dari index.html lama Anda */
                html {
                    cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><circle cx='8' cy='8' r='7' fill='none' stroke='%230f0' stroke-width='1.5'/><line x1='8' y1='1' x2='8' y2='3' stroke='%230f0' stroke-width='1'/><line x1='8' y1='13' x2='8' y2='15' stroke='%230f0' stroke-width='1'/><line x1='1' y1='8' x2='3' y2='8' stroke='%230f0' stroke-width='1'/><line x1='13' y1='8' x2='15' y2='8' stroke='%230f0' stroke-width='1'/></svg>") 8 8, auto;
                }
            `
        }} />
      </Head>

      {/* Load Tailwind CSS dan Tone.js */}
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js" strategy="beforeInteractive" />
      
      {/* Script Utama */}
      <Script type="module" src="/osint-script.js" strategy="afterInteractive" />

      {/* Target DOM untuk rendering UI dari osint-script.js */}
      <main id="root" />
    </>
  );
}
