import { Http, HttpAuth } from '@/app/api/api';
import type { IAuthPayload, IRegisterPayload } from '../types/auth.types';
import type {
  IAuthResponse,
  IAuthSessionResponse,
} from '@/shared/types/auth.types';

class AuthService {
  async loginService(payload: IAuthPayload): Promise<IAuthResponse> {
    const { data } = await Http.post('/auth', payload);

    return data.data;
  }

  async registerService(payload: IRegisterPayload): Promise<IAuthResponse> {
    const { data } = await Http.post('/auth/register', payload);

    return data.data;
  }

  async getSessionAuthService(): Promise<IAuthSessionResponse> {
    const { data } = await HttpAuth.get('/auth/session');

    return data.data;
  }
}

export default new AuthService();
