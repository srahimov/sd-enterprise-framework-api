import { APIRequestContext, APIResponse } from '@playwright/test';
import { UserClient }                     from '@clients/UserClient';
import {
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  UserDetail,
  GetUserResponse,
  UserMutationResponse,
}                                         from '@appTypes/user';
import { parseBody }                      from '@helpers/responseHelper';
import { createLogger }                   from '@utils/logger';
import { generateUser }                   from '@utils/random';

export class UserService {
  private client: UserClient;
  private logger  = createLogger('UserService');

  constructor(request: APIRequestContext) {
    this.client = new UserClient(request);
  }

  // ─── Create User ────────────────────────────────────────────────────────────
  // POST /api/createAccount
  // Returns raw response + parsed body — tests assert on both
  async createUser(
    payload: CreateUserRequest
  ): Promise<{ response: APIResponse; body: UserMutationResponse }> {
    this.logger.info('Creating user', { email: payload.email });

    const response = await this.client.createUser(payload);
    const body     = await parseBody<UserMutationResponse>(response);

    this.logger.debug('Create user response', {
      status:       response.status(),
      responseCode: body.responseCode,
      message:      body.message,
    });

    return { response, body };
  }

  // ─── Update User ────────────────────────────────────────────────────────────
  // PUT /api/updateAccount
  // Returns raw response + parsed body
  async updateUser(
    payload: UpdateUserRequest
  ): Promise<{ response: APIResponse; body: UserMutationResponse }> {
    this.logger.info('Updating user', { email: payload.email });

    const response = await this.client.updateUser(payload);
    const body     = await parseBody<UserMutationResponse>(response);

    this.logger.debug('Update user response', {
      status:       response.status(),
      responseCode: body.responseCode,
      message:      body.message,
    });

    return { response, body };
  }

  // ─── Delete User ────────────────────────────────────────────────────────────
  // DELETE /api/deleteAccount
  // Returns raw response + parsed body
  async deleteUser(
    payload: DeleteUserRequest
  ): Promise<{ response: APIResponse; body: UserMutationResponse }> {
    this.logger.info('Deleting user', { email: payload.email });

    const response = await this.client.deleteUser(payload);
    const body     = await parseBody<UserMutationResponse>(response);

    this.logger.debug('Delete user response', {
      status:       response.status(),
      responseCode: body.responseCode,
      message:      body.message,
    });

    return { response, body };
  }

  // ─── Get User By Email ───────────────────────────────────────────────────────
  // GET /api/getUserDetailByEmail?email=x
  // Returns raw response + parsed UserDetail
  async getUserByEmail(
    email: string
  ): Promise<{ response: APIResponse; body: GetUserResponse }> {
    this.logger.info('Getting user by email', { email });

    const response = await this.client.getUserByEmail(email);
    const body     = await parseBody<GetUserResponse>(response);

    this.logger.debug('Get user response', {
      status:       response.status(),
      responseCode: body.responseCode,
      userId:       body.user?.id,
    });

    return { response, body };
  }

  // ─── Get User Detail ─────────────────────────────────────────────────────────
  // Convenience method — returns just the UserDetail object
  // Usage: const user = await userService.getUserDetail('test@test.com')
  async getUserDetail(email: string): Promise<UserDetail> {
    const { body } = await this.getUserByEmail(email);
    return body.user;
  }

  // ─── Create User and Get Details ─────────────────────────────────────────────
  // Multi-step: creates user THEN fetches their details
  // Verifies user was persisted correctly after creation
  // Primary method for user creation tests
  async createUserAndGetDetails(
    payload: CreateUserRequest
  ): Promise<{
    createResponse: APIResponse;
    createBody:     UserMutationResponse;
    userDetail:     UserDetail;
  }> {
    this.logger.info('Creating user and fetching details', {
      email: payload.email,
    });

    // Step 1: Create the user
    const { response: createResponse, body: createBody } =
      await this.createUser(payload);

    // Step 2: Fetch the created user's details
    const userDetail = await this.getUserDetail(payload.email);

    this.logger.info('User created and details fetched', {
      email:  payload.email,
      userId: userDetail.id,
    });

    return { createResponse, createBody, userDetail };
  }

  // ─── Create Random User ───────────────────────────────────────────────────────
  // Generates a random user payload and creates the account
  // Used by seedTestData and tests that need a fresh user
  async createRandomUser(
    overrides?: Partial<CreateUserRequest>
  ): Promise<{
    payload:  CreateUserRequest;
    response: APIResponse;
    body:     UserMutationResponse;
  }> {
    const payload = generateUser(overrides);
    this.logger.info('Creating random user', { email: payload.email });

    const { response, body } = await this.createUser(payload);
    return { payload, response, body };
  }

  // ─── Create and Delete ────────────────────────────────────────────────────────
  // Creates a user then immediately deletes them
  // Used for tests that need to verify delete works
  // Also used by globalTeardown for cleanup
  async createAndDelete(
    payload: CreateUserRequest
  ): Promise<{
    createBody: UserMutationResponse;
    deleteBody: UserMutationResponse;
  }> {
    this.logger.info('Creating and deleting user', { email: payload.email });

    const { body: createBody } = await this.createUser(payload);
    const { body: deleteBody } = await this.deleteUser({
      email:    payload.email,
      password: payload.password,
    });

    return { createBody, deleteBody };
  }

  // ─── Safe Delete ──────────────────────────────────────────────────────────────
  // Deletes a user — does not throw if user doesn't exist
  // Used by globalTeardown for safe cleanup of seeded data
  async safeDelete(email: string, password: string): Promise<void> {
    try {
      await this.deleteUser({ email, password });
      this.logger.info('Safe delete succeeded', { email });
    } catch (err) {
      this.logger.warn('Safe delete failed — user may not exist', { email });
    }
  }
}
