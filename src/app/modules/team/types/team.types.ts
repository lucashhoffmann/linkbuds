import type { UserRole } from '@/shared/types/auth.types';

export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: string;
}

export interface ITeamInvite {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

export interface ITeamUsage {
  members: number;
  pendingInvites: number;
  maxMembers: number;
  available: number;
}

export interface ITeam {
  usage: ITeamUsage;
  members: ITeamMember[];
  invites: ITeamInvite[];
}

/** The link is returned only here; the API keeps just its hash. */
export interface ICreatedInvite {
  invite: ITeamInvite;
  url: string;
}

export interface IInvitePreview {
  companyName: string;
  email: string;
  expiresAt: string;
}
