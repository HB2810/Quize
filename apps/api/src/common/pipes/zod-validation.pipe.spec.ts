import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

const schema = z.object({
  name: z.string().min(1),
  count: z.number().int(),
});

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe(schema);

  it("returns parsed data for valid input", () => {
    expect(pipe.transform({ name: "a", count: 2 })).toEqual({
      name: "a",
      count: 2,
    });
  });

  it("strips unknown keys instead of passing them through", () => {
    const result = pipe.transform({ name: "a", count: 2, extra: "x" });
    expect(result).not.toHaveProperty("extra");
  });

  it("throws BadRequestException with field paths for invalid input", () => {
    try {
      pipe.transform({ name: "", count: "two" });
      fail("expected BadRequestException");
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as {
        code: string;
        details: Array<{ path: string }>;
      };
      expect(body.code).toBe("VALIDATION_FAILED");
      const paths = body.details.map((d) => d.path);
      expect(paths).toContain("name");
      expect(paths).toContain("count");
    }
  });
});
