import {
  buildIntegrationTestApp,
  IntegrationTestApp,
} from "../../../shared/integration-app.builder";

describe("User Query Endpoints (Integration)", () => {
  let testApp: IntegrationTestApp;

  async function signupAndLogin(
    overrides: Partial<{
      email: string;
      nickname: string;
      password: string;
    }> = {},
  ) {
    const payload = {
      email: overrides.email ?? "user@example.com",
      nickname: overrides.nickname ?? "johndoe",
      password: overrides.password ?? "password123",
    };

    const res = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload,
    });

    return res.json() as { userId: string; tokens: { accessToken: string; refreshToken: string } };
  }

  async function createAdminAndLogin(): Promise<string> {
    const signupRes = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: "admin@example.com",
        nickname: "admin",
        password: "password123",
      },
    });

    const adminUserId = (signupRes.json() as { userId: string }).userId;
    await testApp.dataSource.query("UPDATE users SET role = $1 WHERE id = $2", [
      "admin",
      adminUserId,
    ]);

    const loginRes = await testApp.app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@example.com", password: "password123" },
    });

    return loginRes.json().tokens?.accessToken as string;
  }

  beforeEach(async () => {
    testApp = await buildIntegrationTestApp();
    await testApp.dataSource.query("TRUNCATE users, refresh_tokens CASCADE");
  });

  afterEach(async () => {
    await testApp.app.close();
    await testApp.dataSource.destroy();
  });

  describe("GET /auth/me", () => {
    it("returns profile of the current user", async () => {
      const { tokens } = await signupAndLogin({ email: "user@example.com" });

      const res = await testApp.app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.email).toBe("user@example.com");
      expect(body.nickname).toBe("johndoe");
      expect(body.role).toBe("user");
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it("does not expose passwordHash in response", async () => {
      const { tokens } = await signupAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = res.json();
      expect(body.password).toBeUndefined();
      expect(body.passwordHash).toBeUndefined();
    });

    it("returns 401 when no token provided", async () => {
      const res = await testApp.app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when token is invalid", async () => {
      const res = await testApp.app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: "Bearer invalid-token" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns createdAt as ISO 8601 string", async () => {
      const { tokens } = await signupAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = res.json();
      expect(() => new Date(body.createdAt)).not.toThrow();
      expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt);
    });
  });

  describe("GET /users", () => {
    it("admin receives list of all users", async () => {
      const adminToken = await createAdminAndLogin();
      await signupAndLogin({ email: "user1@example.com", nickname: "user1" });
      await signupAndLogin({ email: "user2@example.com", nickname: "user2" });

      const res = await testApp.app.inject({
        method: "GET",
        url: "/users",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.total).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(body.users)).toBe(true);
    });

    it("returns 403 for non-admin user", async () => {
      const { tokens } = await signupAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: "/users",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it("returns 401 when no token provided", async () => {
      const res = await testApp.app.inject({
        method: "GET",
        url: "/users",
      });

      expect(res.statusCode).toBe(401);
    });

    it("each user in list has correct structure without sensitive fields", async () => {
      const adminToken = await createAdminAndLogin();
      await signupAndLogin({ email: "user@example.com", nickname: "user" });

      const res = await testApp.app.inject({
        method: "GET",
        url: "/users",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const { users } = res.json();
      users.forEach((user: any) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.nickname).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.createdAt).toBeDefined();
        expect(user.password).toBeUndefined();
        expect(user.passwordHash).toBeUndefined();
      });
    });
  });

  describe("GET /users/:userId", () => {
    it("admin receives user details by id", async () => {
      const adminToken = await createAdminAndLogin();
      const { userId } = await signupAndLogin({
        email: "target@example.com",
        nickname: "target",
      });

      const res = await testApp.app.inject({
        method: "GET",
        url: `/users/${userId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.id).toBe(userId);
      expect(body.email).toBe("target@example.com");
    });

    it("returns 404 when user does not exist", async () => {
      const adminToken = await createAdminAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: "/users/00000000-0000-0000-0000-000000000000",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(404);
    });

    it("returns 403 for non-admin user", async () => {
      const { tokens, userId } = await signupAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: `/users/${userId}`,
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it("returns 400 when userId is not a valid UUID", async () => {
      const adminToken = await createAdminAndLogin();

      const res = await testApp.app.inject({
        method: "GET",
        url: "/users/not-a-uuid",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
