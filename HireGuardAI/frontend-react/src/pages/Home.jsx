import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, Play } from 'lucide-react';
import CinematicIntro from '../components/CinematicIntro';
import CyberBackground from '../components/CyberBackground';
import WoodcutSkullCanvas from '../components/WoodcutSkullCanvas';

/**
 * Public Landing Page (`Home.jsx`) featuring the requested Woodcut Engraved Stipple Skull Artwork Animation on Pitch Black (#000000).
 */
const Home = () => {
  const navigate = useNavigate();
  const [showCinematic, setShowCinematic] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?name=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#f3f0e8] flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Cinematic Intro Animation Overlay */}
      {showCinematic && (
        <CinematicIntro onComplete={() => setShowCinematic(false)} />
      )}

      {/* 2. Interactive Canvas Background */}
      <CyberBackground />

      {/* Replay Cinematic Control */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-4 flex justify-end">
        <button
          onClick={() => setShowCinematic(true)}
          className="flex items-center gap-2 text-xs font-mono text-[#f3f0e8] bg-[#161514] border border-[#333330] px-4 py-2 rounded-full shadow-lg hover:bg-[#ffffff] hover:text-[#000000] transition-all cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 fill-current text-[#00E5FF] animate-pulse" />
          REPLAY CINEMATIC INTRO ↗
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-[calc(100vh-5rem)]">
        
        {/* Hero Section */}
        <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-black tracking-tight text-[#f3f0e8] max-w-4xl mx-auto leading-[0.95] mb-6 uppercase">
            Trust Before <br /> You Apply.
          </h1>

          <p className="text-base sm:text-lg text-[#a39e93] max-w-xl mx-auto leading-relaxed font-light mb-8">
            AI-powered Employer Trust Verification using Graph Intelligence, Explainable AI, NLP, and Community Scam Intelligence.
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              to="/search"
              className="btn-pill-black text-sm px-8 py-3.5 bg-[#ffffff] text-[#000000] hover:bg-[#e2ded4] shadow-xl group border-none font-bold"
            >
              Verify Employer
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative my-6">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-[#a39e93]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Company (e.g. Google, Meta, Amazon)..."
                className="input-nexora pl-12 pr-32 py-3.5 text-sm bg-[#161514] border-[#333330] text-[#f3f0e8]"
              />
              <button
                type="submit"
                className="absolute right-1.5 btn-pill-black py-2 px-5 text-xs bg-[#ffffff] text-[#000000] border-none font-bold"
              >
                Search ↗
              </button>
            </div>
          </form>

          {/* HAND-DRAWN WOODCUT ENGRAVED SKULL CANVAS ARTWORK ANIMATION */}
          <WoodcutSkullCanvas />

          {/* Partner Logo Strip */}
          <div className="mt-8 pt-8 border-t border-[#222220]">
            <p className="text-xs font-mono text-[#8c867a] uppercase tracking-wider mb-6">
              Trusted by teams of every scale
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85 font-heading font-bold text-sm sm:text-base tracking-tight text-[#f3f0e8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f3f0e8]"></span> MERCURY
              </span>
              <span className="flex items-center gap-1">
                ramp <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
              <span className="font-extrabold tracking-widest">HEX</span>
              <span className="flex items-center gap-1">
                ▲ Vercel
              </span>
              <span className="font-mono">descript</span>
              <span className="flex items-center gap-1 font-bold">
                $ Cash App
              </span>
              <span className="tracking-widest font-black">SUPERCELL</span>
              <span className="font-mono tracking-wider">runway</span>
            </div>
          </div>

        </section>

        {/* Feature Cards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="nexora-card p-8 bg-[#121110] border border-[#333330]">
              <div className="w-10 h-10 rounded-full bg-[#f3f0e8] text-[#000000] flex items-center justify-center mb-6 font-heading font-bold">
                01
              </div>
              <h3 className="text-xl font-heading font-bold text-[#f3f0e8] mb-3">
                Dual-Graph Intelligence
              </h3>
              <p className="text-xs text-[#a39e93] leading-relaxed">
                Linking MongoDB document profiles (`27017`) with real-time multi-hop graph relationship traversals in Neo4j (`7687`).
              </p>
            </div>

            <div className="nexora-card p-8 bg-[#121110] border border-[#333330]">
              <div className="w-10 h-10 rounded-full bg-[#f3f0e8] text-[#000000] flex items-center justify-center mb-6 font-heading font-bold">
                02
              </div>
              <h3 className="text-xl font-heading font-bold text-[#f3f0e8] mb-3">
                Explainable AI Classifier
              </h3>
              <p className="text-xs text-[#a39e93] leading-relaxed">
                FastAPI Python microservice (`8001`) evaluating job description text, regex entity flags, and semantic phrase density.
              </p>
            </div>

            <div className="nexora-card p-8 bg-[#121110] border border-[#333330]">
              <div className="w-10 h-10 rounded-full bg-[#f3f0e8] text-[#000000] flex items-center justify-center mb-6 font-heading font-bold">
                03
              </div>
              <h3 className="text-xl font-heading font-bold text-[#f3f0e8] mb-3">
                Browser DOM Extension
              </h3>
              <p className="text-xs text-[#a39e93] leading-relaxed">
                Manifest V3 in-browser extension parsing job board DOM elements on LinkedIn and Indeed in real-time.
              </p>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#222220] py-8 bg-[#000000] text-center text-xs text-[#8c867a]">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <span>HIREGUARD® — Cyber Intelligence</span>
            <span>Dual-Cluster Status: <strong className="text-[#00E5FF]">Online (`27017` / `7687`)</strong></span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;
