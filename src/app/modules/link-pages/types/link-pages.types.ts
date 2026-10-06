/**
 * POST = sub-page of a bio for one social post (/p/:bio/:post).
 * FORM = sub-page of a bio with a form (/p/:bio/:form).
 */
export type LinkPageType = 'AGENCY' | 'CLIENT' | 'POST' | 'FORM';

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'CHECKBOX'
  | 'CHOICE'
  | 'MULTI_CHOICE';

export type FormField = {
  /** Stable key: answers are keyed by it. */
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string | null;
  /** SELECT, CHOICE and MULTI_CHOICE. */
  options?: string[];
  /** Score per option, same order as `options` (never sent to the public page). */
  points?: number[];
  /** CHOICE/MULTI_CHOICE: free-text "Outro" answer. */
  allowOther?: boolean;
  /** One answer per value within the cohort (e.g. one per email). */
  unique?: boolean;
};

export type FormMode = 'LIST' | 'QUESTIONNAIRE';

/** POINTS = sum of chosen options' points; CORRECT = questions right (points > 0 = right option). */
export type FormScoring = { kind: 'POINTS' | 'CORRECT'; show: boolean };

export type FormConfig = {
  fields: FormField[];
  /** Absent = LIST (all fields on one screen). */
  mode?: FormMode;
  /** null/absent = only collect. */
  scoring?: FormScoring | null;
  submitLabel: string;
  successMessage: string;
  /** Animated check with the success message. Absent = on. */
  successAnimation?: boolean;
  /** After the success message, the visitor is sent here. */
  redirectUrl?: string | null;
  /** Answers per cohort; reaching it closes the form. null = no limit. */
  maxResponses?: number | null;
  /** Server-owned (close/reopen). Absent = '1'. */
  cohort?: string;
  /** Server-owned: set when closed (by hand or by the limit). */
  closedAt?: string | null;
};

/** Current cohort progress toward `maxResponses`; null = no limit. */
export type FormLimit = {
  max: number;
  current: number;
  cohort: string;
  closed: boolean;
};

export type FormAnswerValue = string | boolean | string[] | null;

export type FormSubmission = {
  id: string;
  /** Form's cohort when answered. */
  cohort: string;
  /** Label copied at submit time. */
  answers: Array<{ id: string; label: string; value: FormAnswerValue }>;
  visitorId: string | null;
  ipAddress: string | null;
  countryCode: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  /** null = not in the Google Sheet yet (or no sheet configured). */
  durationMs: number | null;
  /** Questionnaire score; null when the form only collects. */
  score: number | null;
  scoreMax: number | null;
  webhookDeliveredAt: string | null;
  createdAt: string;
};

export type FormSubmissionsResponse = {
  /** Newest first, capped at 500. */
  items: FormSubmission[];
  total: number;
  /** Answers in the current cohort (what the limit counts). */
  cohortTotal: number;
};
export type LinkPageStatus = 'ACTIVE' | 'INACTIVE';
export type LinkPageLayout = 'LAYOUT_1' | 'LAYOUT_2' | 'LAYOUT_3';
export type LinkPageBackgroundType = 'SOLID' | 'IMAGE' | 'GRADIENT';
export type LinkPageFooterMode = 'LINKBUDS' | 'CUSTOM' | 'HIDDEN';
export type LinkPageFooterStyle = 'TEXT' | 'PILL' | 'BOX';
export type LinkPageFooterSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type FooterSettings = {
  footerMode: LinkPageFooterMode;
  footerText: string | null;
  footerUrl: string | null;
  footerLogoUrl: string | null;
  footerStyle?: LinkPageFooterStyle;
  footerBackgroundColor?: string | null;
  footerBorderColor?: string | null;
  footerColor?: string | null;
  footerBold?: boolean;
  footerFontSize?: LinkPageFooterSize;
  footerLogoSize?: LinkPageFooterSize;
};
export type LinkPageLinkPlacement = 'HORIZONTAL' | 'VERTICAL';
/** PREVIEW = vertical card with image + description (from the site's OG tags). */
export type LinkPageLinkKind = 'LINK' | 'CONTACT' | 'PREVIEW';
export type LinkPageContactType = 'WHATSAPP' | 'EMAIL' | 'PHONE';
/** Media height; CUSTOM uses `customHeight` (px, 80–800). */
export type LinkPageMediaSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM';
export type SocialPlatform =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'LINKEDIN'
  | 'X'
  | 'WHATSAPP'
  | 'GITHUB'
  | 'PINTEREST';

export type AnalyticsEventType =
  'PAGE_VIEW' | 'PAGE_EXIT' | 'LINK_CLICK' | 'SOCIAL_CLICK' | 'IMAGE_CLICK';

export type AnalyticsTargetType =
  'HORIZONTAL_LINK' | 'VERTICAL_LINK' | 'SOCIAL_LINK' | 'IMAGE';

export type LinkPageLink = {
  id: string;
  placement: LinkPageLinkPlacement;
  kind: LinkPageLinkKind;
  label: string;
  url: string | null;
  contactType: LinkPageContactType | null;
  contactValue: string | null;
  previewImageUrl?: string | null;
  previewDescription?: string | null;
  /** Image height of a PREVIEW card. */
  displaySize?: LinkPageMediaSize;
  customHeight?: number | null;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderEnabled: boolean;
  sortOrder: number;
  active: boolean;
};

export type LinkPageSocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  sortOrder: number;
  active: boolean;
};

export type LinkPageImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  targetUrl: string | null;
  sortOrder: number;
  active: boolean;
};

/** YouTube, Vimeo or a direct .mp4/.webm/.mov file. */
export type LinkPageVideo = {
  id: string;
  url: string;
  title: string | null;
  autoplay: boolean;
  controls: boolean;
  size: LinkPageMediaSize;
  customHeight: number | null;
  sortOrder: number;
  active: boolean;
};

export type TextRunSize = 'SM' | 'MD' | 'LG' | 'XL';

/** One formatted piece of a text block; `\n` in `text` = line break. */
export type TextRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** `#RRGGBB`; absent = page text color. */
  color?: string;
  size?: TextRunSize;
};

export type LinkPageTextAlign = 'LEFT' | 'CENTER' | 'RIGHT';

export type LinkPageText = {
  id: string;
  content: TextRun[];
  /** Same shapes as the footer; background/border apply to PILL and BOX. */
  style?: LinkPageFooterStyle;
  align?: LinkPageTextAlign;
  backgroundColor?: string | null;
  borderColor?: string | null;
  /** PILL/BOX: fill the content width instead of hugging the text. */
  fullWidth?: boolean;
  sortOrder: number;
  active: boolean;
};

export type LinkPageSummary = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  /** Path after `/p/`: `bio` or `bio/post`. */
  publicPath: string;
  type: LinkPageType;
  parentPageId: string | null;
  postNetwork: SocialPlatform | null;
  postUrl: string | null;
  status: LinkPageStatus;
  layout: LinkPageLayout;
  title: string;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LinkPageDetail = LinkPageSummary & {
  backgroundType: LinkPageBackgroundType;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  /** Text colors; null = renderer default. */
  titleColor?: string | null;
  subtitleColor?: string | null;
  footerColor?: string | null;
  /** End color when backgroundType is GRADIENT (top → bottom). */
  backgroundGradientColor?: string;
  titleBold?: boolean;
  subtitleBold?: boolean;
  footerBold?: boolean;
  /** CUSTOM footer shape; background/border apply to PILL and BOX. */
  footerStyle?: LinkPageFooterStyle;
  footerBackgroundColor?: string | null;
  footerBorderColor?: string | null;
  footerFontSize?: LinkPageFooterSize;
  footerLogoSize?: LinkPageFooterSize;
  avatarUrl: string | null;
  footerMode: LinkPageFooterMode;
  footerText: string | null;
  footerUrl: string | null;
  footerLogoUrl: string | null;
  /** Owner's GTM container (bio only; posts inherit on the public page). */
  gtmContainerId: string | null;
  ga4MeasurementId: string | null;
  /** FORM pages only. */
  form?: FormConfig | null;
  /** FORM pages only: Apps Script URL feeding a Google Sheet. Not public. */
  formWebhookUrl?: string | null;
  links: LinkPageLink[];
  socialLinks: LinkPageSocialLink[];
  images: LinkPageImage[];
  videos: LinkPageVideo[];
  /** Absent in public responses cached before text blocks existed. */
  texts?: LinkPageText[];
};

export type PublicLinkPage = Omit<
  LinkPageDetail,
  | 'companyId'
  | 'type'
  | 'createdAt'
  | 'updatedAt'
  | 'publicPath'
  | 'parentPageId'
> & {
  /** Bio slug when this is a post or form sub-page. */
  parentSlug: string | null;
};

export type LinkPagesUsage = {
  usedClientPages: number;
  maxClientPages: number;
  remainingClientPages: number;
  usedForms: number;
  maxForms: number;
};

export type LinkPagesListResponse = {
  items: LinkPageSummary[];
  usage: LinkPagesUsage;
};

export type LinkPageAnalyticsSummary = {
  onlineNow: number;
  pageViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  clickThroughRate: number;
  averageDurationMs: number;
  /** Form answers in the period; 0 for non-form pages. */
  formSubmissions: number;
  /** Avg time from opening the form to submitting; 0 when untracked. */
  averageFormDurationMs: number;
  /** Questionnaire score in the period; null = no scored answers. */
  averageFormScore: { score: number; max: number } | null;
};

export type LinkPageAnalyticsTier = 'BASIC' | 'FULL';

export type LinkPageAnalyticsTarget = {
  targetId: string;
  targetType: AnalyticsTargetType;
  clicks: number | string;
};

export type LinkPageAnalyticsTimeseriesPoint = {
  date: string;
  count: number | string;
};

export type LinkPageAnalyticsGroupItem = {
  label: string;
  count: number | string;
};

export type LinkPageAnalyticsVisitorIp = {
  ip: string;
  count: number;
  lastSeenAt: string;
};

export type LinkPageAnalyticsInsights = {
  tier: LinkPageAnalyticsTier;
  range: {
    from: string;
    to: string;
  };
  summary: LinkPageAnalyticsSummary;
  /** FORM pages with a response limit only. */
  formLimit: FormLimit | null;
  topTargets: LinkPageAnalyticsTarget[];
  timeseries: LinkPageAnalyticsTimeseriesPoint[];
  sources: LinkPageAnalyticsGroupItem[];
  devices: LinkPageAnalyticsGroupItem[];
  countries: LinkPageAnalyticsGroupItem[];
  /** Most recent first; available on every plan. */
  visitorIps: LinkPageAnalyticsVisitorIp[];
  limits: {
    maxRangeDays: number | null;
    advancedDimensionsEnabled: boolean;
  };
};

export type LinkPageAnalyticsGeoVisit = {
  createdAt: string;
  ipAddress: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  source: string | null;
};

export type LinkPageAnalyticsGeo = {
  realtime: boolean;
  total: number;
  /** countryCode is ISO alpha-2 or 'unknown'; visits are the latest ones. */
  locations: Array<{
    countryCode: string;
    count: number;
    visits: LinkPageAnalyticsGeoVisit[];
  }>;
};

export type LinkPageLinkClickCount = {
  linkId: string;
  clicks: number | string;
};

export type LinkPageLinkClicksResponse = {
  items: LinkPageLinkClickCount[];
};

export type CompanyDomain = {
  id: string;
  hostname: string;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'FAILED';
  verificationToken: string;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  /** TXT proves ownership; CNAME routes traffic. Both are required. */
  dnsRecords: Array<{
    purpose: 'OWNERSHIP' | 'ROUTING';
    type: 'TXT' | 'CNAME';
    name: string;
    value: string;
  }>;
};

export type LinkPageViewModel = LinkPageDetail | PublicLinkPage;

export type LinkPagesOverviewPage = LinkPageSummary & {
  pageViews: number;
  visitors: number;
  clicks: number;
  /** Form responses, all-time. */
  submissions: number;
  formLimit: FormLimit | null;
};

/** Agency dashboard: traffic per page in the plan's analytics window. */
export type LinkPagesOverview = {
  tier: 'BASIC' | 'FULL';
  range: { from: string; to: string };
  totals: { pageViews: number; visitors: number; clicks: number };
  pages: LinkPagesOverviewPage[];
};

export type LinkPreview = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};
