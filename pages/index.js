import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("../public/osint-script.js")
        .then(() => {
          console.log("OSINT Script loaded");
        })
        .catch((e) => {
          console.error("Failed to load script", e);
        });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Sistem Pemrosesan Data OSINT V7</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:," />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.FIREBASE_CONFIG_JSON = JSON.stringify(${JSON.stringify({
                apiKey: "YOUR_API_KEY",
                authDomain: "YOUR_PROJECT.firebaseapp.com",
                projectId: "YOUR_PROJECT_ID",
                storageBucket: "YOUR_PROJECT.appspot.com",
                messagingSenderId: "SENDER_ID",
                appId: "APP_ID",
                measurementId: "MEASUREMENT_ID"
              })});
              window.APP_ID = "osint-v7";
            `,
          }}
        />
      </Head>

      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js" strategy="beforeInteractive" />

      {/* Root of the original index.html layout (replaced with embedded) */}
      <div id="root">
        <noscript>Loading...</noscript>
      </div>
    </>
  );
}
