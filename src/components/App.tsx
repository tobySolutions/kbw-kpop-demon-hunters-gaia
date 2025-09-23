"use client";

import { useMiniApp } from "@neynar/react";
import KPopHunter from "~/components/ui/KPopHunter";

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the KPop Demon Hunters game.
 * 
 * This component provides a streamlined experience focused on the core game:
 * - Direct access to the KPop Demon Hunter companion
 * - Farcaster mini app integration
 * - Character assignment and management
 * - No tab navigation - game is the main focus
 */
export default function App({ title: _title }: AppProps = {}) {
  // --- Hooks ---
  const { isSDKLoaded, context } = useMiniApp();

  // Use the user's FID as the userId for the KPop Demon Hunter
  const userId = context?.user?.fid?.toString() || 'demo-user';

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 animate-pulse filter drop-shadow-lg mx-auto">
            <img 
              src="/characters.png" 
              alt="KPop Demon Hunter Loading" 
              className="w-full h-full rounded-full object-cover border-2 border-purple-400 shadow-lg"
            />
          </div>
          <div className="spinner h-10 w-10 mx-auto mb-4 border-4 border-purple-300 border-t-purple-600"></div>
          <p className="text-lg font-bold text-purple-800 tracking-wide">Summoning Hunter...</p>
          <p className="text-sm text-purple-600 mt-2">Preparing your KPop Demon Hunter companion</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Main Game Content - Full Width */}
      <div className="pb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Main Game Component */}
          <div className="w-full">
            <KPopHunter userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}

