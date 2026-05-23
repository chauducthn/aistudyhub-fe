import { Link } from 'react-router-dom'
import aiChatIcon from '../assets/icons/ai-chat.svg'
import cloudUploadIcon from '../assets/icons/cloud-upload.svg'
import dashboardIcon from '../assets/icons/dashboard.svg'
import documentBoxIcon from '../assets/icons/document-box.svg'
import searchIcon from '../assets/icons/search.svg'
import subjectFilterIcon from '../assets/icons/subject-filter.svg'
import logo from '../assets/logos/ai-study-hub-logo.svg'
import chaosImageTwo from '../assets/images/figma-export-1.svg'
import chaosImageOne from '../assets/images/figma-export-3.svg'
import laptopPreview from '../assets/images/homepage-laptop.png'
import { useAuth } from '../context/useAuth'

const featureCards = [
  {
    title: 'Cloud Upload',
    text: 'Sync files from Drive, Dropbox, or your local machine.',
    icon: cloudUploadIcon,
    iconType: 'cloud',
    bg: 'bg-[#dce9ff]',
    iconBg: 'bg-[#c8d2ff]',
  },
  {
    title: 'Subject Filtering',
    text: 'Auto-sort documents by course or topic with smart tags.',
    icon: subjectFilterIcon,
    iconType: 'filter',
    bg: 'bg-[#e5eeff]',
    iconBg: 'bg-[#cfe8f3]',
  },
  {
    title: 'Fast Search',
    text: 'OCR search that finds text even in scanned PDFs and photos.',
    icon: searchIcon,
    iconType: 'search',
    bg: 'bg-[#dce9ff]',
    iconBg: 'bg-[#d8ccff]',
  },
  {
    title: 'Document Preview',
    text: 'Instant, blur-free viewing for over 50 document types.',
    icon: documentBoxIcon,
    iconType: 'eye',
    bg: 'bg-[#e5eeff]',
    iconBg: 'bg-[#d7d4ff]',
  },
]

const footerColumns = [
  { title: 'PLATFORM', items: ['About', 'Research', 'Features', 'Pricing'] },
  { title: 'RESOURCES', items: ['Documentation', 'Help Center', 'Community'] },
  { title: 'LEGAL', items: ['Privacy Policy', 'Terms of Service', 'Support'] },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <Header isAuthenticated={isAuthenticated} />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <StepsSection />
      <AudienceSection />
      <FinalCta />
      <Footer />
    </main>
  )
}

function Header({ isAuthenticated }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#c7c4d8]/30 bg-[#f8f9ff]/80 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="AI Study Hub" className="h-8 w-8 shrink-0" />
          <span className="truncate text-xl font-bold text-[#3525cd]">AI Study Hub</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            className="border-b-2 border-[#3525cd] pb-1 pt-1 text-[#3525cd]"
            href="#features"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 700, lineHeight: '24px' }}
          >
            Features
          </a>
          <a className="pb-1 pt-1 text-base text-[#464555]" href="#pricing">
            Pricing
          </a>
        </div>

        <Link
          to={isAuthenticated ? '/profile' : '/login'}
          className="rounded-lg bg-[#3525cd] px-6 py-2 text-sm font-medium text-white"
        >
          {isAuthenticated ? 'Profile' : 'Login'}
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-20 sm:px-8">
      <div className="pointer-events-none absolute right-[6%] top-10 h-96 w-96 rounded-full bg-[#3525cd] opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-[14%] h-64 w-64 rounded-full bg-[#00687a] opacity-10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#57dffe]/30 bg-[#57dffe]/20 px-4 py-2 text-xs font-semibold uppercase text-[#006172]">
          <SparkIcon />
          NEW: AI FLASHCARDS GENERATOR
        </div>

        <h1 className="mt-8 max-w-5xl text-4xl font-bold leading-tight text-[#0b1c30] sm:text-[46px] lg:text-[52px]">
          Manage Your Study Documents <span className="text-[#3525cd]">Smarter</span>
          <br />
          with AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-7 text-[#464555]">
          Stop drowning in PDFs. Centralize your storage, organize subjects automatically, and chat with your notes to
          extract instant insights.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-[#3525cd] px-8 py-[18px] text-sm font-medium text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.2)]"
          >
            Get Started
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-[#3525cd]/20 bg-[#57dffe]/10 px-8 py-[17px] text-sm font-medium text-[#3525cd]">
            <PlayIcon />
            Watch Demo
          </button>
        </div>

        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-[#c7c4d8]/30 bg-white p-px shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <img
            src={laptopPreview}
            alt="AI Study Hub dashboard preview"
            className="aspect-video w-full rounded-2xl object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="bg-[#eff4ff] px-4 py-24 sm:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold leading-10 text-[#0b1c30]">The Academic Chaos Problem</h2>
          <p className="mt-6 max-w-xl text-lg leading-7 text-[#464555]">
            Scattered PDFs across folders, handwritten notes in forgotten notebooks, and no way to search through
            hundreds of pages when finals are next week.
          </p>
          <ul className="mt-8 space-y-4 text-base leading-6 text-[#0b1c30]">
            <ProblemItem>Disorganized file names that mean nothing at 2 AM.</ProblemItem>
            <ProblemItem>Hours wasted scanning documents for specific definitions.</ProblemItem>
            <ProblemItem>No centralized way to link concepts across different subjects.</ProblemItem>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src={chaosImageOne}
            alt=""
            className="aspect-square w-full rounded-2xl object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
          />
          <img
            src={chaosImageTwo}
            alt=""
            className="aspect-square w-full rounded-2xl object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
          />
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-10 text-[#0b1c30]">Built for Serious Scholars</h2>
          <p className="mt-4 text-lg leading-7 text-[#464555]">
            Intelligent features that turn your mess into a knowledge base.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <article className="relative overflow-hidden rounded-3xl bg-[#3525cd] p-7 text-white sm:p-8 lg:col-span-8 lg:row-span-2 lg:min-h-[528px]">
            <img src={aiChatIcon} alt="" className="h-12 w-12 rounded-lg bg-white/10 p-3" />
            <h3 className="mt-7 text-2xl font-semibold leading-8">AI Chatbot Assistant</h3>
            <p className="mt-3 max-w-sm text-base leading-6 text-white/80">
              Ask questions directly to your documents. Get summaries, definitions, and cross-referenced citations in
              seconds.
            </p>
            <div className="mt-32 max-w-xs rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-sm leading-5 backdrop-blur-sm lg:mt-36">
              AI: Based on your Biology notes, the mitochondria is the powerhouse of the cell...
            </div>
            <div className="pointer-events-none absolute -bottom-16 right-8 h-80 w-80 opacity-20">
              <ChatBubbleGraphic />
            </div>
          </article>

          {featureCards.slice(0, 2).map((card) => (
            <FeatureCard key={card.title} {...card} className="lg:col-span-4" />
          ))}

          {featureCards.slice(2).map((card) => (
            <FeatureCard key={card.title} {...card} className="lg:col-span-4" />
          ))}

          <article className="rounded-3xl bg-[#0b1c30] p-7 text-white sm:p-8 lg:col-span-4">
            <IconBadge type="history" className="bg-white/10 text-[#57dffe]" />
            <div className="mt-20">
              <h3 className="text-xl font-semibold leading-7">Chat History</h3>
              <p className="mt-1 text-sm leading-5 text-white/60">
                Never lose a breakthrough. Every AI insight is saved forever.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-bold leading-10 text-[#0b1c30]">Three Steps to Academic Mastery</h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          <Step
            iconBg="bg-[#3525cd]"
            iconType="upload"
            number="1"
            title="Upload"
            text="Drag and drop your lecture notes, PDFs, and textbooks into our secure cloud vault."
          />
          <Step
            iconBg="bg-[#57dffe]"
            iconType="organize"
            number="2"
            title="Organize"
            text="Our AI automatically categories your files by subject and extracts key topics for you."
          />
          <Step
            iconBg="bg-[#571ac0]"
            iconType="chat"
            number="3"
            title="Chat"
            text="Ask questions, generate study guides, and master complex topics through dialogue."
          />
        </div>
      </div>
    </section>
  )
}

function AudienceSection() {
  return (
    <section id="pricing" className="px-4 pb-24 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <AudienceCard
          iconType="student"
          title="For Students"
          text="Master your curriculum in half the time. Use AI to bridge gaps in your lecture notes and create perfect study guides automatically."
          items={['Exam Preparation', 'Thesis Research']}
          linkText="See Student Plans"
          bg="bg-[#dce9ff]"
        />
        <AudienceCard
          icon={dashboardIcon}
          iconType="educator"
          title="For Educators"
          text="Manage reading materials for your entire class. Track document engagement and use AI to generate quizzes and assessment questions."
          items={['Curriculum Design', 'Resource Distribution']}
          linkText="See Educator Features"
          bg="bg-[#e6f7fb]"
        />
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="px-4 pb-24 sm:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-[#0b1c30] px-6 py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.22),transparent_42%)]" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold leading-10">Ready to Ace Your Next Semester?</h2>
          <p className="mt-6 text-lg leading-7 text-white/70">
            Join 50,000+ students and educators who have revolutionized their study habits with AI Study Hub.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="rounded-full bg-[#3525cd] px-10 py-4 text-sm font-medium">
              Start Free Trial
            </Link>
            <Link to="/login" className="rounded-full border border-white/20 bg-white/10 px-10 py-4 text-sm font-medium">
              Contact Sales
            </Link>
          </div>
          <p className="mt-6 text-xs font-semibold leading-4 text-white/40">No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#c7c4d8]/30 bg-[#eff4ff] px-4 pb-8 pt-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="AI Study Hub" className="h-8 w-8" />
              <span className="text-xl font-bold text-[#3525cd]">AI Study Hub</span>
            </Link>
            <p className="mt-6 max-w-xs text-base leading-6 text-[#464555]">
              Empowering academic excellence through artificial intelligence.
            </p>
            <div className="mt-8 flex gap-4">
              <SocialIcon label="X" />
              <SocialIcon label="in" />
              <SocialIcon label="GH" />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold uppercase text-[#0b1c30]">{column.title}</h3>
                <ul className="mt-6 space-y-4 text-sm leading-5 text-[#464555]">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#c7c4d8]/30 pt-8 text-sm text-[#464555] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2024 AI Study Hub. All rights reserved.</span>
          <span>United States (English)</span>
        </div>
      </div>
    </footer>
  )
}

function FeatureCard({ title, text, icon, iconType, bg, iconBg, className = '' }) {
  return (
    <article className={`${bg} ${className} rounded-3xl border border-[#c7c4d8]/20 p-7 sm:p-8`}>
      {iconType ? (
        <IconBadge type={iconType} className={`${iconBg} ${getIconColor(iconType)}`} />
      ) : (
        <img src={icon} alt="" className={`${iconBg} h-10 w-10 rounded-lg p-2.5`} />
      )}
      <div className="mt-20">
        <h3 className="text-xl font-semibold leading-7 text-[#0b1c30]">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-[#464555]">{text}</p>
      </div>
    </article>
  )
}

function ProblemItem({ children }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#c92a2a] text-[#c92a2a]">
        <XIcon />
      </span>
      <span>{children}</span>
    </li>
  )
}

function Step({ number, title, text, iconBg, iconType }) {
  return (
    <article className="text-center">
      <div className={`${iconBg} mx-auto grid h-14 w-14 place-items-center rounded-full text-white shadow-lg`}>
        <StepIcon type={iconType} />
      </div>
      <h3 className="mt-6 text-base font-semibold leading-6 text-[#0b1c30]">
        {number}. {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-[#464555]">{text}</p>
    </article>
  )
}

function StepIcon({ type }) {
  if (type === 'organize') return <OrganizeStepIcon />
  if (type === 'chat') return <ChatStepIcon />
  return <UploadStepIcon />
}

function AudienceCard({ iconType, title, text, items, linkText, bg }) {
  return (
    <article className={`${bg} rounded-3xl border border-[#c7c4d8]/20 p-8 text-[#0b1c30]`}>
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg text-white ${
          iconType === 'educator' ? 'bg-[#00687a]' : 'bg-[#3525cd]'
        }`}
      >
        {iconType === 'student' ? <GraduationCapIcon /> : <EducatorBoardIcon />}
      </span>
      <h3 className="mt-8 text-xl font-semibold leading-7">{title}</h3>
      <p className="mt-4 max-w-xl text-sm leading-5 text-[#464555]">{text}</p>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-medium leading-5">
            <span className="grid h-5 w-5 place-items-center rounded-full border border-[#3525cd] text-[#3525cd]">
              <CheckIcon />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#00687a]">
        {linkText}
        <ArrowRightIcon />
      </Link>
    </article>
  )
}

function SocialIcon({ label }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-bold text-[#464555] shadow-sm">
      {label === 'X' && <XSocialIcon />}
      {label === 'in' && <LinkedInIcon />}
      {label === 'GH' && <GitHubIcon />}
    </span>
  )
}

function XSocialIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M13.9 10.47 21.33 2h-1.76l-6.45 7.35L7.97 2H2.03l7.8 11.14L2.03 22h1.76l6.82-7.76L16.06 22H22l-8.1-11.53Zm-2.42 2.75-.79-1.11L4.4 3.3h2.73l5.06 7.1.79 1.11 6.6 9.25h-2.73l-5.37-7.54Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <span className="grid h-[22px] w-[22px] place-items-center rounded-[3px] bg-[#464555] text-[14px] font-black leading-none text-white">
      in
    </span>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M12 2.25c-5.4 0-9.75 4.38-9.75 9.8 0 4.33 2.8 8 6.68 9.3.49.09.67-.22.67-.48v-1.7c-2.72.6-3.29-1.18-3.29-1.18-.44-1.14-1.08-1.44-1.08-1.44-.89-.6.07-.6.07-.6.98.07 1.5 1.02 1.5 1.02.87 1.5 2.29 1.07 2.85.82.09-.64.34-1.07.62-1.32-2.17-.25-4.45-1.09-4.45-4.85 0-1.07.38-1.95 1.01-2.64-.1-.25-.44-1.25.1-2.6 0 0 .83-.27 2.69 1a9.3 9.3 0 0 1 4.9 0c1.86-1.27 2.68-1 2.68-1 .54 1.35.2 2.35.1 2.6.63.69 1.01 1.57 1.01 2.64 0 3.77-2.29 4.59-4.47 4.84.35.3.66.9.66 1.82v2.69c0 .26.18.57.67.47a9.79 9.79 0 0 0 6.68-9.3c0-5.42-4.36-9.8-9.75-9.8Z" />
    </svg>
  )
}

function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current stroke-[2.4]">
      <path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" strokeLinejoin="round" />
      <path d="M7 10.5v5L12 18l5-2.5v-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8.5v6" strokeLinecap="round" />
    </svg>
  )
}

function EducatorBoardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current stroke-[2.3]">
      <path d="M4.25 19V5.25A1.75 1.75 0 0 1 6 3.5h12.25a1.75 1.75 0 0 1 1.75 1.75V19" strokeLinecap="round" />
      <circle cx="9.25" cy="9.5" r="2.15" />
      <path d="M5.6 16.35c.7-2 1.92-3 3.65-3s2.95 1 3.65 3" strokeLinecap="round" />
      <path d="M5.6 17.75h7.3" strokeLinecap="round" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M3.5 8h9" strokeLinecap="round" />
      <path d="m9 4.5 3.5 3.5L9 11.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBadge({ type, className = '' }) {
  return (
    <span className={`grid h-12 w-12 place-items-center rounded-lg ${className}`}>
      {type === 'cloud' && <CloudUploadGlyph />}
      {type === 'filter' && <FilterGlyph />}
      {type === 'search' && <SearchGlyph />}
      {type === 'eye' && <EyeGlyph />}
      {type === 'history' && <HistoryGlyph />}
    </span>
  )
}

function getIconColor(type) {
  if (type === 'filter' || type === 'history') return 'text-[#00687a]'
  return 'text-[#3525cd]'
}

function CloudUploadGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[26px] w-[26px] fill-none stroke-current stroke-[2.3]">
      <path
        d="M7.8 17.5H6.9a4.15 4.15 0 0 1-.55-8.25 5.85 5.85 0 0 1 11.25 1.45 3.45 3.45 0 0 1-.75 6.8h-.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 17.5V10.8" strokeLinecap="round" />
      <path d="m8.95 13.75 3.05-3.05 3.05 3.05" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[24px] w-[24px] fill-none stroke-current stroke-[2.5]">
      <path d="M5 7h14" strokeLinecap="round" />
      <path d="M8 12h8" strokeLinecap="round" />
      <path d="M10.5 17h3" strokeLinecap="round" />
    </svg>
  )
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[24px] w-[24px] fill-none stroke-current stroke-[2.75]">
      <circle cx="10.75" cy="10.75" r="5.75" />
      <path d="m15.1 15.1 4.15 4.15" strokeLinecap="round" />
    </svg>
  )
}

function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[25px] w-[25px] fill-none stroke-current stroke-[2.4]">
      <path
        d="M2.75 12s3.25-5.25 9.25-5.25S21.25 12 21.25 12 18 17.25 12 17.25 2.75 12 2.75 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  )
}

function HistoryGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[24px] w-[24px] fill-none stroke-current stroke-[2.4]">
      <path d="M5.5 7.5A7.2 7.2 0 1 1 4.8 16" strokeLinecap="round" />
      <path d="M5.5 3.75v3.75h3.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.25V12l2.6 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M10 1.8 11.9 7l5.3 1.9-5.3 1.9L10 16.2l-1.9-5.4-5.3-1.9L8.1 7 10 1.8Z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M7 4.4v11.2L15.4 10 7 4.4Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[3]">
      <path d="m5 10.2 3 3L15.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="m10 8.6 3.3-3.3 1.4 1.4-3.3 3.3 3.3 3.3-1.4 1.4-3.3-3.3-3.3 3.3-1.4-1.4L8.6 10 5.3 6.7l1.4-1.4L10 8.6Z" />
    </svg>
  )
}

function UploadStepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current stroke-2">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4" />
      <path d="M12 17V10.5" strokeLinecap="round" />
      <path d="m9.25 13.25 2.75-2.75 2.75 2.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OrganizeStepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-[#00687a] stroke-[2.4]">
      <path
        d="M3.5 7.25c0-.97.78-1.75 1.75-1.75h4.2l2 2h7.3c.97 0 1.75.78 1.75 1.75v6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 7.25v9.5c0 .97.78 1.75 1.75 1.75h9.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17.75" cy="16.75" r="2.1" />
      <path
        d="M17.75 12.65v1.2M17.75 19.65v1.2M13.65 16.75h1.2M20.65 16.75h1.2M14.85 13.85l.85.85M19.8 18.8l.85.85M20.65 13.85l-.85.85M15.7 18.8l-.85.85"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChatStepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path d="M5 5.5h14v10H9l-4 3.5V5.5Z" strokeLinejoin="round" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" strokeLinecap="round" />
    </svg>
  )
}

function ChatBubbleGraphic() {
  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className="h-full w-full fill-none stroke-white stroke-[28]">
      <path d="M45 65h230v150H110l-65 60V65Z" />
      <path d="M95 115h150M95 160h150M95 205h95" />
    </svg>
  )
}
