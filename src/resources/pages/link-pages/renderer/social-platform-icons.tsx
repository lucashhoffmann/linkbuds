import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import type { IconType } from 'react-icons/lib';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import type { SocialPlatform } from '@/app/modules/link-pages/types/link-pages.types';

export const socialPlatformIcons: Record<SocialPlatform, IconType> = {
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebookF,
  TIKTOK: FaTiktok,
  YOUTUBE: FaYoutube,
  LINKEDIN: FaLinkedinIn,
  X: FaXTwitter,
  WHATSAPP: FaWhatsapp,
  GITHUB: FaGithub,
  PINTEREST: FaPinterestP,
};

export const socialPlatformLabels: Record<SocialPlatform, string> = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  LINKEDIN: 'LinkedIn',
  X: 'X',
  WHATSAPP: 'WhatsApp',
  GITHUB: 'GitHub',
  PINTEREST: 'Pinterest',
};
