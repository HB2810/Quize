import { validateEnv } from "./env.schema";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  WEB_ORIGIN: "http://localhost:3000",
};

describe("validateEnv", () => {
  it("accepts a valid environment and applies defaults", () => {
    const env = validateEnv(validEnv);
    expect(env.API_PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
  });

  it("coerces API_PORT from string", () => {
    const env = validateEnv({ ...validEnv, API_PORT: "8080" });
    expect(env.API_PORT).toBe(8080);
  });

  it("applies default DATABASE_URL when omitted", () => {
    const { DATABASE_URL: _omitted, ...rest } = validEnv;
    const env = validateEnv(rest);
    expect(env.DATABASE_URL).toContain("postgresql://");
  });

  it("rejects a non-PostgreSQL DATABASE_URL", () => {
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_URL: "mysql://localhost/db" }),
    ).toThrow(/PostgreSQL/);
  });

  it("rejects an invalid WEB_ORIGIN", () => {
    expect(() =>
      validateEnv({ ...validEnv, WEB_ORIGIN: "not-a-url" }),
    ).toThrow(/WEB_ORIGIN/);
  });

  it("rejects an out-of-range port", () => {
    expect(() => validateEnv({ ...validEnv, API_PORT: "70000" })).toThrow(
      /API_PORT/,
    );
  });
});
