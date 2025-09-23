import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{
        background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #4a2c7a 100%)'
      }}>
        {/* KPop Demon Hunters Main Image */}
        <img 
          src={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/k-pop-demon-main.jpeg`}
          alt="KPop Demon Hunters" 
          tw="w-64 h-64 mb-8 rounded-full object-cover border-4 border-purple-400 shadow-lg"
        />
        
        {/* Main Title */}
        <h1 tw="text-7xl font-bold text-center mb-4" style={{
          color: '#ff6b9d',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {user?.display_name ? `${user.display_name}'s Demon Hunter!` : 'Meet Your KPop Demon Hunter!'}
        </h1>
        
        {/* Subtitle */}
        <p tw="text-4xl text-center mb-6" style={{
          color: '#c77dff'
        }}>
          Your AI KPop Demon Hunter Companion ⚔️✨
        </p>
        
        {/* Footer */}
        <div tw="flex items-center text-2xl" style={{
          color: '#e0aaff',
          opacity: 0.9
        }}>
          <span tw="mr-2">🎵</span>
          <span>Powered by Gaia AI</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}