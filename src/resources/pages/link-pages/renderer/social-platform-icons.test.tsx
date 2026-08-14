import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { describe, expect, it } from 'vitest';
import { socialPlatformIcons } from './social-platform-icons';

describe('socialPlatformIcons', () => {
  it('maps each social platform to its real brand icon', () => {
    expect(socialPlatformIcons).toMatchObject({
      FACEBOOK: FaFacebookF,
      GITHUB: FaGithub,
      INSTAGRAM: FaInstagram,
      LINKEDIN: FaLinkedinIn,
      PINTEREST: FaPinterestP,
      TIKTOK: FaTiktok,
      WHATSAPP: FaWhatsapp,
      X: FaXTwitter,
      YOUTUBE: FaYoutube,
    });
  });
});
