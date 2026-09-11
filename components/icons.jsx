import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  ShieldCheck,
  Clock,
  Users,
  Search,
  FileText,
  Settings,
  Zap,
  PlugZap,
  AlertCircle,
  CheckCircle2,
  Building2,
  Award,
  Activity,
  Home,
  LayoutDashboard,
  AlertTriangle,
  Camera,
  Bell,
  Inbox,
  Newspaper,
  Star,
  Image as ImageLucide,
  Wrench,
  SlidersHorizontal,
  Map as MapLucide,
  LogOut,
  Menu,
  ExternalLink,
  Calendar,
  X,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Plus,
  Upload,
  Link2,
  Copy,
  Sparkles,
  Printer,
  Lightbulb,
  Globe,
  ClipboardList,
  User,
  Download,
  Wallet,
} from "lucide-react";

export const Arrow = ArrowRight;
export const ArrowLeftIcon = ArrowLeft;
export const ArrowRightIcon = ArrowRight;
export { ChevronDown, ChevronRight as ChevronRightIcon };
export const PhoneIcon = Phone;
export const MailIcon = Mail;
export const PinIcon = MapPin;
export const ShieldIcon = Shield;
export const AmcBadge = ShieldCheck;
export const ClockIcon = Clock;
export const UsersIcon = Users;
export const SearchIcon = Search;
export const ReportIcon = FileText;
export const GearIcon = Settings;
export const BoltBadge = Zap;
export const InstallBadge = PlugZap;
export const AlertBadge = AlertCircle;
export const CheckCircle = CheckCircle2;
export const BuildingIcon = Building2;
export const AwardIcon = Award;
export const NetworkIcon = Activity;
export const HomeIcon = Home;
export const DashboardIcon = LayoutDashboard;
export const AlertIcon = AlertTriangle;
export const CameraIcon = Camera;
export const BellIcon = Bell;
export const InboxIcon = Inbox;
export const ArticleIcon = Newspaper;
export const StarIcon = Star;
export const ImageIcon = ImageLucide;
export const WrenchIcon = Wrench;
export const SlidersIcon = SlidersHorizontal;
export const MapIcon = MapLucide;
export const LogoutIcon = LogOut;
export const MenuIcon = Menu;
export const ExternalLinkIcon = ExternalLink;
export const CalendarIcon = Calendar;
export const XIcon = X;
export const LockIcon = Lock;
export const EyeIcon = Eye;
export const EyeOffIcon = EyeOff;
export const TrashIcon = Trash2;
export const EditIcon = Pencil;
export const PlusIcon = Plus;
export const UploadIcon = Upload;
export const LinkIcon = Link2;
export const CopyIcon = Copy;
export const SparklesIcon = Sparkles;
export const PrinterIcon = Printer;
export const LightbulbIcon = Lightbulb;
export const GlobeIcon = Globe;
export const ClipboardIcon = ClipboardList;
export const UserIcon = User;
export const DownloadIcon = Download;
export const WalletIcon = Wallet;

// Brand marks — kept as hand-drawn SVG since lucide-react has no logo/brand icon set.
export const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.17c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.12-.42-.14-.95-.32-1.64-.62-2.88-1.24-4.75-4.13-4.9-4.32-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.69-.8.87-1.08.19-.28.37-.23.62-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
  </svg>
);

export const LinkedInIcon = (props) => (
  <svg viewBox="-3 -3 30 30" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
  </svg>
);

export const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
  </svg>
);

export const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4l6.4 3.6Z" />
  </svg>
);
