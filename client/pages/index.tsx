import Head from "next/head";
import dynamic from "next/dynamic";
import styles from "@/styles/Home.module.css";

// Import GameCanvas with dynamic import and SSR disabled (because it uses browser APIs)
const GameCanvas = dynamic(() => import('@/src/components/game/GameCanvas'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>3D Car Racing Game</title>
        <meta name="description" content="A 3D car racing game with real-time physics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Game container taking full viewport */}
      <div className={styles.gameContainer}>
        <GameCanvas />
      </div>
    </>
  );
}
