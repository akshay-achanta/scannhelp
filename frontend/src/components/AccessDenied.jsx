import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F97316] p-4 relative overflow-hidden">
      
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex flex-col items-center justify-center mb-4">
        {/* Curved Text SVG */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full drop-shadow-md z-0 overflow-visible">
          <path id="curve" d="M -20 250 A 220 220 0 1 1 420 250" fill="transparent" />
          <text className="text-[28px] sm:text-[32px] font-bold fill-white tracking-widest" style={{ fontFamily: 'sans-serif' }}>
            <textPath href="#curve" startOffset="50%" textAnchor="middle">
              THIS INFO CAN'T BE ACCESSED
            </textPath>
          </text>
        </svg>

        {/* Emoji and Sign */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-16">
          {/* Main Emoji */}
          <span className="text-[120px] sm:text-[140px] drop-shadow-xl leading-none" role="img" aria-label="sad">
            🥺
          </span>
          
          {/* Sorry Sign */}
          <div className="relative -mt-10 z-20 flex items-center justify-center">
            {/* Left Hand */}
            <div className="absolute -left-4 w-8 h-8 bg-[#FFD700] rounded-full border-2 border-yellow-600 shadow-md z-30"></div>
            
            {/* Sign Board */}
            <div className="bg-white px-6 py-2 rounded-2xl shadow-xl border-b-4 border-gray-300 z-20 transform rotate-1">
              <span className="text-3xl sm:text-4xl font-black text-black tracking-widest" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                SORRY
              </span>
            </div>
            
            {/* Right Hand */}
            <div className="absolute -right-4 w-8 h-8 bg-[#FFD700] rounded-full border-2 border-yellow-600 shadow-md z-30"></div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/')} 
        className="mt-8 px-8 py-3 bg-white text-[#F97316] rounded-full font-bold shadow-xl hover:bg-gray-50 transition-colors z-10"
      >
        Return to Home
      </button>
    </div>
  );
}
