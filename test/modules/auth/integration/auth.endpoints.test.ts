import { FastifyInstance } from "fastify";
import { buildTestApp, TestApp } from "./app.builder";

describe("Auth Endpoints (Integration)", () => {
  let testApp: TestApp;
  let app: FastifyInstance;

  beforeEach(async () => {
    testApp = await buildTestApp();
    app = testApp.app;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /auth/signup", () => {
    it("returns 201 and a token pair on successful signup", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.userId).toBeDefined();
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });

    it("returns 409 when email is already registered", async () => {
      await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });

      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "other",
          password: "password123",
        },
      });

      expect(res.statusCode).toBe(409);
    });

    it("returns 409 when nickname is already taken", async () => {
      await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });

      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "other@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });

      expect(res.statusCode).toBe(409);
    });

    it("returns 400 when email is invalid (Fastify schema validation)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "not-an-email",
          nickname: "johndoe",
          password: "password123",
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when nickname is too short", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "ab",
          password: "password123",
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when password is too short", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "1234567",
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: { email: "user@example.com" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "correct-password",
        },
      });
    });

    it("returns 200 and tokens for valid credentials", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "user@example.com", password: "correct-password" },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });

    it("returns 401 for wrong password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "user@example.com", password: "wrong-password" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when email does not exist", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "ghost@example.com", password: "any-password" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 400 when request body is empty", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/logout", () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });
      refreshToken = res.json().tokens.refreshToken;
    });

    it("returns 204 on successful logout", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: { refreshToken },
      });

      expect(res.statusCode).toBe(204);
    });

    it("invalidates the token after logout", async () => {
      await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: { refreshToken },
      });

      const hash = testApp.tokenService.hashToken(refreshToken);
      const stored = await testApp.refreshTokenRepo.findByTokenHash(hash);
      expect(stored?.isRevoked()).toBe(true);
    });

    it("returns 401 for an unknown token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: { refreshToken: "refresh.nobody.user" },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: {
          email: "user@example.com",
          nickname: "johndoe",
          password: "password123",
        },
      });
      refreshToken = res.json().tokens.refreshToken;
    });

    it("returns 200 and a new token pair", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });

    it("returns 401 on reuse of the old token", async () => {
      await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });

      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for an invalid token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "totally-invalid" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("the new token can be used for the next refresh", async () => {
      const first = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });
      const newRefreshToken = first.json().tokens.refreshToken;

      const second = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: newRefreshToken },
      });

      expect(second.statusCode).toBe(200);
    });
  });
});
