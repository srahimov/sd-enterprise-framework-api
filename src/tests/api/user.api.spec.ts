import {
  test,
  expect,
  assertCreated,
  assertDeleted,
  assertUpdated,
  assertSuccess,
  createUserPayload,
  createRandomUserPayload,
  updateUserPayload,
  EXPECTED_RESPONSES,
  EXPECTED_USER_FIELDS,
  HTTP,
  MESSAGES,
} from '@fixtures';

test.describe('User API — @users', () => {

  // ─── API 11: POST /api/createAccount ──────────────────────────────────────
  test.describe('POST /api/createAccount', () => {

    test('should create a new user account with valid data @smoke @regression', async ({ userService }) => {
      const payload = createUserPayload();

      const { response, body } = await userService.createUser(payload);

      assertCreated(response, body);
      expect(body.message).toBe(MESSAGES.USER.CREATED);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.USER.CREATE_SUCCESS.responseCode);

      // Cleanup
      await userService.safeDelete(payload.email, payload.password);
    });

    test('should create user with title Mr @regression', async ({ userService }) => {
      const payload = createUserPayload({ title: 'Mr' });
      const { response, body } = await userService.createUser(payload);

      assertCreated(response, body);

      await userService.safeDelete(payload.email, payload.password);
    });

    test('should create user with title Mrs @regression', async ({ userService }) => {
      const payload = createUserPayload({ title: 'Mrs' });
      const { response, body } = await userService.createUser(payload);

      assertCreated(response, body);

      await userService.safeDelete(payload.email, payload.password);
    });

    test('should create user with all randomised fields @regression', async ({ userService }) => {
      const payload = createRandomUserPayload();
      const { response, body } = await userService.createUser(payload);

      assertCreated(response, body);
      expect(response.status()).toBe(HTTP.CREATED);

      await userService.safeDelete(payload.email, payload.password);
    });

    test('should persist user data after creation @regression', async ({ userService }) => {
      const payload = createUserPayload({
        firstname: 'PersistTest',
        lastname:  'User',
        city:      'London',
        country:   'United Kingdom',
      });

      const { createBody, userDetail } = await userService.createUserAndGetDetails(payload);

      // Assert creation
      assertCreated({ status: () => HTTP.CREATED } as never, createBody);

      // Assert persistence — fields match what was sent
      expect(userDetail.email).toBe(payload.email);
      expect(userDetail.first_name).toBe(payload.firstname);
      expect(userDetail.last_name).toBe(payload.lastname);
      expect(userDetail.city).toBe(payload.city);
      expect(userDetail.country).toBe(payload.country);

      await userService.safeDelete(payload.email, payload.password);
    });

  });

  // ─── API 12: DELETE /api/deleteAccount ────────────────────────────────────
  test.describe('DELETE /api/deleteAccount', () => {

    test('should delete an existing user account @smoke @regression', async ({ userService }) => {
      // Create user first
      const payload = createUserPayload();
      await userService.createUser(payload);

      // Delete the user
      const { response, body } = await userService.deleteUser({
        email:    payload.email,
        password: payload.password,
      });

      assertDeleted(response, body);
      expect(body.message).toBe(MESSAGES.USER.DELETED);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.USER.DELETE_SUCCESS.responseCode);
    });

    test('should confirm user no longer accessible after deletion @regression', async ({ userService }) => {
      const payload = createUserPayload();
      await userService.createUser(payload);

      // Delete
      await userService.deleteUser({
        email:    payload.email,
        password: payload.password,
      });

      // Attempt to fetch deleted user — should return non-200
      const { response } = await userService.getUserByEmail(payload.email);
      expect(response.status()).not.toBe(HTTP.OK);
    });

  });

  // ─── API 13: PUT /api/updateAccount ───────────────────────────────────────
  test.describe('PUT /api/updateAccount', () => {

    test('should update an existing user account @smoke @regression', async ({ userService }) => {
      // Create user
      const createData = createUserPayload();
      await userService.createUser(createData);

      // Update user
      const updateData = updateUserPayload(createData.email, createData.password, {
        name:      'Updated Name',
        firstname: 'Updated',
        lastname:  'Name',
        city:      'Chicago',
      });

      const { response, body } = await userService.updateUser(updateData);

      assertUpdated(response, body);
      expect(body.message).toBe(MESSAGES.USER.UPDATED);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.USER.UPDATE_SUCCESS.responseCode);

      // Cleanup
      await userService.safeDelete(createData.email, createData.password);
    });

    test('should reflect updated data when fetched after update @regression', async ({ userService }) => {
      const createData = createUserPayload();
      await userService.createUser(createData);

      const updateData = updateUserPayload(createData.email, createData.password, {
        firstname: 'UpdatedFirst',
        lastname:  'UpdatedLast',
        city:      'Seattle',
        state:     'Washington',
      });

      await userService.updateUser(updateData);

      // Verify update persisted
      const userDetail = await userService.getUserDetail(createData.email);
      expect(userDetail.first_name).toBe('UpdatedFirst');
      expect(userDetail.last_name).toBe('UpdatedLast');
      expect(userDetail.city).toBe('Seattle');

      await userService.safeDelete(createData.email, createData.password);
    });

  });

  // ─── API 14: GET /api/getUserDetailByEmail ────────────────────────────────
  test.describe('GET /api/getUserDetailByEmail', () => {

    test('should return user details for existing account @smoke @regression', async ({ userService }) => {
      const payload = createUserPayload();
      await userService.createUser(payload);

      const { response, body } = await userService.getUserByEmail(payload.email);

      assertSuccess(response, body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(payload.email);

      await userService.safeDelete(payload.email, payload.password);
    });

    test('should return all expected user fields @regression', async ({ userService }) => {
      const payload = createUserPayload();
      await userService.createUser(payload);

      const { body } = await userService.getUserByEmail(payload.email);

      // Verify all expected fields are present
      for (const field of EXPECTED_USER_FIELDS) {
        expect(
          body.user,
          `Expected field "${field}" to be present in user response`
        ).toHaveProperty(field);
      }

      await userService.safeDelete(payload.email, payload.password);
    });

    test('should return correct user id as a number @regression', async ({ userService }) => {
      const payload = createUserPayload();
      await userService.createUser(payload);

      const userDetail = await userService.getUserDetail(payload.email);

      expect(typeof userDetail.id).toBe('number');
      expect(userDetail.id).toBeGreaterThan(0);

      await userService.safeDelete(payload.email, payload.password);
    });

  });

});
