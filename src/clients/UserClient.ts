import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient }                  from './BaseApiClient';
import { ENDPOINTS }                      from '@constants/endpoints';
import { DEFAULT_HEADERS }                from '@config/apiConfig';
import {
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
}                                         from '@appTypes/user';

export class UserClient extends BaseApiClient {

  constructor(request: APIRequestContext) {
    super(request);
  }

  // ─── Create User ───────────────────────────────────────────────────────────
  // POST /api/createAccount
  // API 11 — all fields required → 201 "User created!"
  async createUser(payload: CreateUserRequest): Promise<APIResponse> {
    this.logger.info('Creating user account', { email: payload.email });

    return this.post(
      ENDPOINTS.USERS.CREATE,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: { ...payload },
      }
    );
  }

  // ─── Update User ───────────────────────────────────────────────────────────
  // PUT /api/updateAccount
  // API 13 — all fields + valid credentials → 200 "User updated!"
  async updateUser(payload: UpdateUserRequest): Promise<APIResponse> {
    this.logger.info('Updating user account', { email: payload.email });

    return this.put(
      ENDPOINTS.USERS.UPDATE,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: { ...payload },
      },
      true  // requiresAuth — credentials injected by authInterceptor
    );
  }

  // ─── Delete User ───────────────────────────────────────────────────────────
  // DELETE /api/deleteAccount
  // API 12 — email + password → 200 "Account deleted!"
  async deleteUser(payload: DeleteUserRequest): Promise<APIResponse> {
    this.logger.info('Deleting user account', { email: payload.email });

    return this.delete(
      ENDPOINTS.USERS.DELETE,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: {
          email:    payload.email,
          password: payload.password,
        },
      }
    );
  }

  // ─── Get User By Email ─────────────────────────────────────────────────────
  // GET /api/getUserDetailByEmail?email=x
  // API 14 — valid email → 200 + user detail object
  async getUserByEmail(email: string): Promise<APIResponse> {
    this.logger.info('Getting user detail by email', { email });

    // ENDPOINTS.USERS.BY_EMAIL() builds the full path with query param
    return this.get(ENDPOINTS.USERS.BY_EMAIL(email));
  }

  // ─── Get User By Email — Missing Email ────────────────────────────────────
  // GET /api/getUserDetailByEmail (no email param)
  // Negative test — missing email query param
  async getUserByEmailMissing(): Promise<APIResponse> {
    this.logger.info('Getting user detail with missing email param');

    return this.get('/api/getUserDetailByEmail');
  }
}
