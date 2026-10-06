import { Http, HttpAuth } from '@/app/api/api';
import type {
  ICreatedInvite,
  IInvitePreview,
  ITeam,
} from '../types/team.types';

type ApiResponse<T> = { data: T };

class TeamService {
  async get(): Promise<ITeam> {
    const { data } = await HttpAuth.get<ApiResponse<ITeam>>('/team');
    return data.data;
  }

  async invite(email: string): Promise<ICreatedInvite> {
    const { data } = await HttpAuth.post<ApiResponse<ICreatedInvite>>(
      '/team/invites',
      { email },
    );
    return data.data;
  }

  async renewInvite(id: string): Promise<ICreatedInvite> {
    const { data } = await HttpAuth.post<ApiResponse<ICreatedInvite>>(
      `/team/invites/${id}/renew`,
    );
    return data.data;
  }

  async revokeInvite(id: string): Promise<void> {
    await HttpAuth.delete(`/team/invites/${id}`);
  }

  async removeMember(userId: string): Promise<void> {
    await HttpAuth.delete(`/team/members/${userId}`);
  }

  async previewInvite(token: string): Promise<IInvitePreview> {
    const { data } = await Http.get<ApiResponse<IInvitePreview>>(
      `/invites/${token}`,
    );
    return data.data;
  }

  /** Session-only route: runs before the app provisions an own company. */
  async acceptInvite(token: string): Promise<void> {
    await Http.post('/invites/accept', { token });
  }
}

export default new TeamService();
