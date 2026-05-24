import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, X } from 'lucide-react'

const LOGO = "https://www.figma.com/api/mcp/asset/99690260-2605-4fec-adfe-832c043be81b"
const HERO_IMG = "https://www.figma.com/api/mcp/asset/8a51b633-b3d7-415a-aa98-b22d0426500c"
const PROBLEM_IMG_1 = "https://www.figma.com/api/mcp/asset/ee4a1519-d5ff-4a31-92fe-4859726efb17"
const PROBLEM_IMG_2 = "https://www.figma.com/api/mcp/asset/1a85b2f0-95f2-4055-b4a9-f077408d002a"
const STEP_UPLOAD_ICON   = "https://www.figma.com/api/mcp/asset/ad9917ff-8022-4b41-8e8e-4420cb4c0e5b"
const STEP_ORGANIZE_ICON = "https://www.figma.com/api/mcp/asset/fb68bb36-1a80-4740-a308-1dce74e6a2ac"
const STEP_CHAT_ICON     = "https://www.figma.com/api/mcp/asset/479b9ee3-8f1f-4a0d-a043-53546a45731f"

const WATCH_DEMO_ICON  = "https://www.figma.com/api/mcp/asset/9fe2caa5-9f77-4739-a987-36297b68819a"
const CHIP_ICON        = "https://www.figma.com/api/mcp/asset/5725d1fe-31fd-4669-8782-1a39925ef786"

const CLOUD_ICON   = "https://www.figma.com/api/mcp/asset/cea11690-cd82-485e-885d-2996ef08b2cf"
const FILTER_ICON  = "https://www.figma.com/api/mcp/asset/85da6cc0-73a6-4c9b-9e49-b4cab2676288"
const SEARCH_ICON  = "https://www.figma.com/api/mcp/asset/540ba48a-770c-4ba8-915a-9c0b04c1820d"
const PREVIEW_ICON = "https://www.figma.com/api/mcp/asset/ddd75cf7-dfdf-4acd-854a-58a8e97700b5"
const HISTORY_ICON = "https://www.figma.com/api/mcp/asset/629dfaf9-ce98-4a72-a121-1175a6ea0bfe"
const AI_BOT_ICON  = "https://www.figma.com/api/mcp/asset/70be306c-8c07-415a-8cdb-8524181df008"
const AI_ICON_BG   = "https://www.figma.com/api/mcp/asset/49778408-fab2-4dcb-9945-cd38842d5112"

const STUDENT_ICON   = "https://www.figma.com/api/mcp/asset/3aceab47-ed2d-4057-b0ff-55d94d451d75"
const EDUCATOR_ICON  = "https://www.figma.com/api/mcp/asset/bfabc85a-f74c-4973-8d02-a07a7beccbe6"
const CHECK_BLUE     = "https://www.figma.com/api/mcp/asset/01631828-947e-4de2-b2f2-36a938f87654"
const CHECK_TEAL     = "https://www.figma.com/api/mcp/asset/a468e192-0d20-42f5-af20-50bc05b6fa3d"
const ARROW_BLUE     = "https://www.figma.com/api/mcp/asset/721b174e-2e1b-44b6-bdb7-e99eb1cb7dae"
const ARROW_TEAL     = "https://www.figma.com/api/mcp/asset/dd109504-9b25-47b1-ab2a-0d281b8559ea"

const SVG_X    = "https://www.figma.com/api/mcp/asset/ef2279b7-9ff2-4254-bdda-f1cac6bf9087"
const SVG_LI   = "https://www.figma.com/api/mcp/asset/aeabfc50-1f1f-437c-bb8b-c2d7d818f094"
const SVG_GH   = "https://www.figma.com/api/mcp/asset/0ca1216e-4dc2-4bbb-b834-f7e8fe195bf5"
const GLOBE    = "https://www.figma.com/api/mcp/asset/4463c40a-02ca-4512-8f7f-a241c8fdcd15"
const CHEVRON  = "https://www.figma.com/api/mcp/asset/109d8cb9-00fa-4565-b9a8-6e44d918dcb9"
const CANCEL   = "https://www.figma.com/api/mcp/asset/66c56a08-d16f-43c5-8325-24965ce1dffa"

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg,#f8f9ff 0%,#f8f9ff 100%)' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backdropFilter: 'blur(6px)', background: 'rgba(248,249,255,0.8)', borderColor: 'rgba(199,196,216,0.3)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src={LOGO} alt="AI Study Hub" className="w-8 h-8" />
            <span className="font-bold text-xl" style={{ color: '#3525cd', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              AI Study Hub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-bold text-base border-b-2 pb-1" style={{ color: '#3525cd', borderColor: '#3525cd' }}>
              Features
            </a>
            <a href="#pricing" className="text-base" style={{ color: '#464555' }}>
              Pricing
            </a>
          </div>

          <Link
            to="/auth"
            className="px-6 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#3525cd' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-8">
        <div className="absolute right-10 top-10 w-96 h-96 rounded-full opacity-10" style={{ background: '#3525cd', filter: 'blur(32px)' }} />
        <div className="absolute right-40 bottom-10 w-64 h-64 rounded-full opacity-10" style={{ background: '#00687a', filter: 'blur(32px)' }} />

        <div className="max-w-[1280px] mx-auto flex flex-col items-center">
          {/* Chip */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
            style={{ background: 'rgba(87,223,254,0.2)', borderColor: 'rgba(87,223,254,0.3)' }}
          >
            <img src={CHIP_ICON} alt="" className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#006172' }}>
              NEW: AI FLASHCARDS GENERATOR
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-[48px] font-bold text-center leading-[60px] tracking-tight mb-6"
            style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Manage Your Study Documents{' '}
            <span className="italic" style={{ color: '#3525cd' }}>Smarter</span>
            <br />with AI
          </h1>

          {/* Subtext */}
          <p className="text-lg text-center mb-10 max-w-[560px]" style={{ color: '#464555' }}>
            Stop drowning in PDFs. Centralize your storage, organize subjects automatically,
            and chat with your notes to extract instant insights.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mb-20">
            <Link
              to="/auth?tab=register"
              className="px-8 py-[18px] rounded-xl text-sm font-medium text-white"
              style={{ background: '#3525cd', boxShadow: '0 10px 15px -3px rgba(53,37,205,0.2),0 4px 6px -4px rgba(53,37,205,0.2)' }}
            >
              Get Started
            </Link>
            <button
              className="flex items-center gap-2 px-8 py-[17px] rounded-xl text-sm font-medium border"
              style={{ background: 'rgba(87,223,254,0.1)', borderColor: 'rgba(53,37,205,0.2)', color: '#3525cd' }}
            >
              <img src={WATCH_DEMO_ICON} alt="" className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Mock App Window */}
          <div className="w-full max-w-[1024px] relative">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(53,37,205,0.05)', filter: 'blur(20px)' }} />
            <div
              className="relative rounded-2xl overflow-hidden border p-px"
              style={{ background: 'white', borderColor: 'rgba(199,196,216,0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <img src={HERO_IMG} alt="App preview" className="w-full aspect-video object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="py-24 px-8" style={{ background: '#eff4ff' }}>
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="text-[32px] font-bold mb-6 leading-10 tracking-tight"
              style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              The Academic Chaos Problem
            </h2>
            <p className="text-lg mb-8 leading-7" style={{ color: '#464555' }}>
              Scattered PDFs across folders, handwritten notes in forgotten notebooks,
              and no way to search through hundreds of pages when finals are next week.
            </p>
            <ul className="space-y-4">
              {[
                'Disorganized file names that mean nothing at 2 AM.',
                'Hours wasted scanning documents for specific definitions.',
                'No centralized way to link concepts across different subjects.',
              ].map(text => (
                <li key={text} className="flex items-center gap-3">
                  <img src={CANCEL} alt="" className="w-5 h-6 flex-shrink-0" />
                  <span className="text-base" style={{ color: '#0b1c30' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-square" style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)' }}>
              <img src={PROBLEM_IMG_1} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)' }}>
              <img src={PROBLEM_IMG_2} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section id="features" className="py-24 px-8">
        <div className="max-w-[1280px] mx-auto">
          <h2
            className="text-[32px] font-bold text-center mb-4 tracking-tight"
            style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Built for Serious Scholars
          </h2>
          <p className="text-lg text-center mb-16" style={{ color: '#464555' }}>
            Intelligent features that turn your mess into a knowledge base.
          </p>

          {/* 12-col bento grid */}
          <div className="grid grid-cols-12 grid-rows-[240px_240px_240px] gap-6">
            {/* AI Chatbot — col 1-8, row 1-2 */}
            <div
              className="col-span-8 row-span-2 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative"
              style={{ background: '#3525cd' }}
            >
              <div className="absolute opacity-20 right-[-10%] bottom-[-10%] w-[333px] h-[333px]">
                <img src={AI_ICON_BG} alt="" className="w-full h-full" />
              </div>
              <div className="flex flex-col gap-3 relative">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <img src={AI_BOT_ICON} alt="" className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mt-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  AI Chatbot Assistant
                </h3>
                <p className="text-base text-white leading-6 max-w-[384px]" style={{ opacity: 0.8 }}>
                  Ask questions directly to your documents. Get summaries, definitions,
                  and cross-referenced citations in seconds.
                </p>
              </div>
              <div
                className="relative rounded-xl p-4 backdrop-blur-sm max-w-xs border"
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <p className="text-sm text-white leading-5">
                  AI: Based on your Biology notes, the<br />
                  mitochondria is the powerhouse of the<br />
                  cell...
                </p>
              </div>
            </div>

            {/* Cloud Upload — col 9-12, row 1 */}
            <div className="col-span-4 row-span-1 rounded-3xl p-8 flex flex-col justify-between border" style={{ background: '#dce9ff', borderColor: 'rgba(199,196,216,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(53,37,205,0.1)' }}>
                <img src={CLOUD_ICON} alt="" className="w-5 h-4" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cloud Upload</h4>
                <p className="text-sm leading-5" style={{ color: '#464555' }}>Sync files from Drive, Dropbox, or your local machine.</p>
              </div>
            </div>

            {/* Subject Filtering — col 9-12, row 2 */}
            <div className="col-span-4 row-span-1 rounded-3xl p-8 flex flex-col justify-between border" style={{ background: '#e5eeff', borderColor: 'rgba(199,196,216,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,104,122,0.1)' }}>
                <img src={FILTER_ICON} alt="" className="w-4 h-3" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Subject Filtering</h4>
                <p className="text-sm leading-5" style={{ color: '#464555' }}>Auto-sort documents by course or topic with smart tags.</p>
              </div>
            </div>

            {/* Fast Search — col 1-4, row 3 */}
            <div className="col-span-4 row-span-1 rounded-3xl p-8 flex flex-col justify-between border" style={{ background: '#dce9ff', borderColor: 'rgba(199,196,216,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(87,26,192,0.1)' }}>
                <img src={SEARCH_ICON} alt="" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Fast Search</h4>
                <p className="text-sm leading-5" style={{ color: '#464555' }}>OCR search that finds text even in scanned PDFs and photos.</p>
              </div>
            </div>

            {/* Document Preview — col 5-8, row 3 */}
            <div className="col-span-4 row-span-1 rounded-3xl p-8 flex flex-col justify-between border" style={{ background: '#e5eeff', borderColor: 'rgba(199,196,216,0.2)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(53,37,205,0.1)' }}>
                <img src={PREVIEW_ICON} alt="" className="w-5 h-4" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Document Preview</h4>
                <p className="text-sm leading-5" style={{ color: '#464555' }}>Instant, blur-free viewing for over 50 document types.</p>
              </div>
            </div>

            {/* Chat History — col 9-12, row 3 */}
            <div className="col-span-4 row-span-1 rounded-3xl p-8 flex flex-col justify-between" style={{ background: '#0b1c30' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <img src={HISTORY_ICON} alt="" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1 text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Chat History</h4>
                <p className="text-sm leading-5 text-white" style={{ opacity: 0.6 }}>Never lose a breakthrough. Every AI insight is saved forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-8 border-y" style={{ background: '#f8f9ff', borderColor: 'rgba(199,196,216,0.2)' }}>
        <div className="max-w-[1280px] mx-auto">
          <h2
            className="text-[32px] font-bold text-center mb-16 tracking-tight"
            style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Three Steps to Academic Mastery
          </h2>
          <div className="grid grid-cols-3 gap-12 relative">
            <div className="absolute h-0.5 left-1/4 right-1/4 top-12" style={{ background: 'linear-gradient(90deg,rgba(199,196,216,0) 0%,#c7c4d8 50%,rgba(199,196,216,0) 100%)' }} />
            {[
              { num: '1', title: '1. Upload',   icon: STEP_UPLOAD_ICON,   bg: '#3525cd', shadow: 'rgba(53,37,205,0.2)', desc: 'Drag and drop your lecture notes, PDFs, and textbooks into our secure cloud vault.' },
              { num: '2', title: '2. Organize', icon: STEP_ORGANIZE_ICON, bg: '#57dffe', shadow: 'rgba(0,104,122,0.1)',   desc: 'Our AI automatically categories your files by subject and extracts key topics for you.' },
              { num: '3', title: '3. Chat',     icon: STEP_CHAT_ICON,     bg: '#571ac0', shadow: 'rgba(87,26,192,0.2)',  desc: 'Ask questions, generate study guides, and master complex topics through dialogue.' },
            ].map(({ title, icon, bg, shadow, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-6 flex-shrink-0" style={{ background: bg, boxShadow: `0 20px 25px -5px ${shadow},0 8px 10px -6px ${shadow}` }}>
                  <img src={icon} alt="" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
                <p className="text-base leading-6" style={{ color: '#464555' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Students & Educators ── */}
      <section className="py-24 px-8">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-8">
          {/* Students */}
          <div className="rounded-3xl p-12 flex flex-col gap-8" style={{ background: '#d3e4fe' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#3525cd' }}>
              <img src={STUDENT_ICON} alt="" className="w-7 h-6" />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>For Students</h3>
              <p className="text-lg leading-7" style={{ color: '#464555' }}>
                Master your curriculum in half the time. Use AI to bridge gaps in your lecture
                notes and create perfect study guides automatically.
              </p>
              <ul className="space-y-3 pt-2">
                {['Exam Preparation', 'Thesis Research'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <img src={CHECK_BLUE} alt="" className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium tracking-wide" style={{ color: '#0b1c30' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="flex items-center gap-2 pt-4 text-sm font-medium" style={{ color: '#3525cd' }}>
                See Student Plans
                <img src={ARROW_BLUE} alt="" className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Educators */}
          <div className="rounded-3xl p-12 flex flex-col gap-8 border" style={{ background: 'rgba(87,223,254,0.1)', borderColor: 'rgba(87,223,254,0.2)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#00687a' }}>
              <img src={EDUCATOR_ICON} alt="" className="w-7 h-6" />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold" style={{ color: '#0b1c30', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>For Educators</h3>
              <p className="text-lg leading-7" style={{ color: '#464555' }}>
                Manage reading materials for your entire class. Track document engagement and
                use AI to generate quizzes and assessment questions.
              </p>
              <ul className="space-y-3 pt-2">
                {['Curriculum Design', 'Resource Distribution'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <img src={CHECK_TEAL} alt="" className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium tracking-wide" style={{ color: '#0b1c30' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="flex items-center gap-2 pt-4 text-sm font-medium" style={{ color: '#00687a' }}>
                See Educator Features
                <img src={ARROW_TEAL} alt="" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA + Footer ── */}
      <footer className="px-8 pt-20 pb-8" style={{ background: '#eff4ff', borderTop: '1px solid rgba(199,196,216,0.3)' }}>
        <div className="max-w-[1280px] mx-auto">

          {/* CTA Card */}
          <div
            className="rounded-[40px] px-72 py-16 mb-16 text-center relative overflow-hidden"
            style={{ background: '#0b1c30', marginLeft: '-16px', marginRight: '-32px' }}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,1) 0%, rgba(79,70,229,0) 50%)' }}
            />
            <div className="relative max-w-[672px] mx-auto flex flex-col items-center gap-6">
              <h2
                className="text-[32px] font-bold text-white text-center tracking-tight"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Ready to Ace Your Next Semester?
              </h2>
              <p className="text-lg text-white text-center leading-7" style={{ opacity: 0.7 }}>
                Join 50,000+ students and educators who have revolutionized their study habits with AI Study Hub.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/auth?tab=register" className="px-10 py-[17px] rounded-full text-sm font-medium text-white" style={{ background: '#3525cd' }}>
                  Start Free Trial
                </Link>
                <button className="px-10 py-[17px] rounded-full text-sm font-medium text-white border" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Contact Sales
                </button>
              </div>
              <p className="text-xs font-semibold text-white" style={{ opacity: 0.4 }}>No credit card required. Cancel anytime.</p>
            </div>
          </div>

          {/* Footer columns */}
          <div className="grid grid-cols-12 gap-12 pb-12 border-b" style={{ borderColor: 'rgba(199,196,216,0.3)' }}>
            <div className="col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img src={LOGO} alt="AI Study Hub" className="w-8 h-8" />
                <span className="font-bold text-xl" style={{ color: '#3525cd', fontFamily: 'Inter, sans-serif' }}>AI Study Hub</span>
              </div>
              <p className="text-base leading-6" style={{ color: '#464555' }}>
                Empowering academic excellence<br />through artificial intelligence.
              </p>
              <div className="flex items-center gap-4">
                {[SVG_X, SVG_LI, SVG_GH].map((src, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center" style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
                    <img src={src} alt="" className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-span-8 grid grid-cols-3 gap-8">
              {[
                { title: 'PLATFORM',  links: ['About','Research','Features','Pricing'] },
                { title: 'RESOURCES', links: ['Documentation','Help Center','Community'] },
                { title: 'LEGAL',     links: ['Privacy Policy','Terms of Service','Support'] },
              ].map(({ title, links }) => (
                <div key={title} className="flex flex-col gap-6">
                  <p className="text-sm font-bold tracking-[0.7px] uppercase" style={{ color: '#0b1c30' }}>{title}</p>
                  <ul className="flex flex-col gap-4">
                    {links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#464555' }}>{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-8">
            <p className="text-sm" style={{ color: '#464555' }}>© 2024 AI Study Hub. All rights reserved.</p>
            <button className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#464555' }}>
              <img src={GLOBE} alt="" className="w-4 h-4" />
              United States (English)
              <img src={CHEVRON} alt="" className="w-2 h-1.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
