import cloudUploadIcon from '../assets/icons/cloud-upload.svg'
import subjectFilterIcon from '../assets/icons/subject-filter.svg'
import searchIcon from '../assets/icons/search.svg'
import documentBoxIcon from '../assets/icons/document-box.svg'

export const HERO_PREVIEW = 'https://www.figma.com/api/mcp/asset/8a51b633-b3d7-415a-aa98-b22d0426500c'

export const featureCards = [
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

export const footerColumns = [
  { title: 'PLATFORM', items: ['About', 'Research', 'Features'] },
  { title: 'RESOURCES', items: ['Documentation', 'Help Center', 'Community'] },
  { title: 'LEGAL', items: ['Privacy Policy', 'Terms of Service', 'Support'] },
]
