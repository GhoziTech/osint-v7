import Head from "next/head";
import Script from "next/script";
import firebaseConfig, { APP_ID } from "../firebaseConfig";
import fs from 'fs';
import path from 'path';

// Kita akan membaca isi dari file HTML tunggal yang sudah diperbaiki (osint-script.js)
// Karena ini adalah lingkungan Next.js, kita bisa menggunakan metode ini untuk menyertakan konten statis.
// Catatan: Di lingkungan Canvas, konten di osint-script.js akan otomatis dimuat sebagai HTML.

export default function Home() {
  // Global variable __initial_auth_token disediakan oleh runtime Canvas.
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Menyuntikkan konfigurasi dan token autentikasi ke window object
  const initScript = `
    window.FIREBASE_CONFIG_JSON = \`${JSON.stringify(firebaseConfig)}\`;
    window.APP_ID = "${APP_ID}";
    window.INITIAL_AUTH_TOKEN = "${initialAuthToken}";
  `;

  return (
    <>
      <Head>
        <title>Sistem Pemrosesan Data OSINT V7</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:," />
        {/* Menyuntikkan konfigurasi sebelum script utama berjalan */}
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
        
        {/* Memuat library global yang dibutuhkan oleh HTML tunggal */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js" strategy="beforeInteractive" />
      </Head>

      {/* Konten file osint-script.js akan dimuat di sini sebagai HTML tunggal */}
      <div id="html-container">
        {/* Konten HTML dari osint-script.js akan ditampilkan secara otomatis */}
      </div>

      <Script type="module" src="/osint-script.js" strategy="afterInteractive" />
    </>
  );
}
