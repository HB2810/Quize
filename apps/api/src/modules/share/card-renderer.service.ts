import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Injectable } from "@nestjs/common";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ShareCardFormat } from "@stavya/contracts";
import type { ShareConfig, SharePayload } from "./share-config.types";

const FORMATS: Record<ShareCardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
};

// Brand asset intrinsic sizes (measured; keep in sync with src/assets).
const LOGO_RATIO = 436 / 1000;
const MARK_RATIO = 600 / 480;

const INK = "#132A3F";
const MUTED = "#6B7C8C";
const PIP_OFF = "#E3ECF4";
const SOFT_BLUE = "#EAF2FB";

/** Minimal satori element factory (no React dependency). */
type El = { type: string; props: Record<string, unknown> };
function el(
  type: string,
  style: Record<string, unknown>,
  children?: El[] | string,
): El {
  return { type, props: { style, children } };
}
function img(
  src: string,
  width: number,
  height: number,
  style: Record<string, unknown> = {},
): El {
  return { type: "img", props: { src, width, height, style } };
}

/**
 * Deterministic share-card renderer: result data + journey share
 * template → PNG. Brand spec §28: white background, journey primary
 * color, Manrope, premium and minimal. Real Stavya logo up top, spine
 * mark as a whisper-light watermark, score pips as the data visual.
 */
@Injectable()
export class CardRendererService {
  private fonts: Array<{ name: string; data: Buffer; weight: number }> | null =
    null;
  private assets: { logo: string; mark: string } | null = null;

  private loadFonts() {
    if (this.fonts) return this.fonts;
    const require = createRequire(__filename);
    const cssPath = require.resolve("@fontsource/manrope/index.css");
    const files = join(dirname(cssPath), "files");
    this.fonts = [400, 700, 800].map((weight) => ({
      name: "Manrope",
      data: readFileSync(join(files, `manrope-latin-${weight}-normal.woff`)),
      weight,
    }));
    return this.fonts;
  }

  private loadAssets() {
    if (this.assets) return this.assets;
    const brandDir = join(__dirname, "..", "..", "assets", "brand");
    const toDataUri = (file: string) =>
      `data:image/png;base64,${readFileSync(join(brandDir, file)).toString("base64")}`;
    this.assets = {
      logo: toDataUri("stavya-logo.png"),
      mark: toDataUri("spine-unit.png"),
    };
    return this.assets;
  }

  /** The 6-pip score visual — filled pips in primary, rest neutral. */
  private pips(payload: SharePayload, primary: string, scale: number): El {
    return el(
      "div",
      { display: "flex", gap: 12 * scale, marginTop: 26 * scale },
      Array.from({ length: payload.total }, (_, i) =>
        el("div", {
          display: "flex",
          width: 58 * scale,
          height: 15 * scale,
          borderRadius: 999,
          backgroundColor: i < payload.score ? primary : PIP_OFF,
        }),
      ),
    );
  }

  private scoreBlock(
    config: ShareConfig,
    payload: SharePayload,
    primary: string,
    scale: number,
  ): El[] {
    return [
      el(
        "div",
        {
          display: "flex",
          fontSize: 26 * scale,
          fontWeight: 700,
          letterSpacing: "0.26em",
          color: MUTED,
        },
        config.card.scoreLabel,
      ),
      el(
        "div",
        { display: "flex", alignItems: "baseline", marginTop: 2 * scale },
        [
          el(
            "div",
            {
              display: "flex",
              fontSize: 210 * scale,
              fontWeight: 800,
              color: primary,
            },
            String(payload.score),
          ),
          el(
            "div",
            {
              display: "flex",
              fontSize: 84 * scale,
              fontWeight: 700,
              color: MUTED,
              marginLeft: 12 * scale,
            },
            `/ ${payload.total}`,
          ),
        ],
      ),
      this.pips(payload, primary, scale),
      el(
        "div",
        {
          display: "flex",
          marginTop: 34 * scale,
          padding: `${17 * scale}px ${48 * scale}px`,
          borderRadius: 999,
          backgroundColor: primary,
          fontSize: 38 * scale,
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "#FFFFFF",
        },
        payload.profile.toUpperCase(),
      ),
    ];
  }

  private ctaBlock(
    config: ShareConfig,
    primary: string,
    displayUrl: string,
    scale: number,
    topMargin: number,
  ): El[] {
    return [
      el(
        "div",
        {
          display: "flex",
          marginTop: topMargin,
          fontSize: 38 * scale,
          fontWeight: 400,
          color: INK,
          maxWidth: 720 * scale,
          textAlign: "center",
        },
        `“${config.card.tagline}”`,
      ),
      el(
        "div",
        {
          display: "flex",
          marginTop: 26 * scale,
          padding: `${16 * scale}px ${42 * scale}px`,
          borderRadius: 999,
          backgroundColor: SOFT_BLUE,
          fontSize: 30 * scale,
          fontWeight: 800,
          color: primary,
        },
        config.card.cta,
      ),
      el(
        "div",
        {
          display: "flex",
          marginTop: 26 * scale,
          fontSize: 24 * scale,
          fontWeight: 400,
          color: MUTED,
        },
        displayUrl,
      ),
    ];
  }

  private watermark(mark: string, size: number): El {
    return el(
      "div",
      {
        display: "flex",
        position: "absolute",
        right: -size * 0.18,
        bottom: -size * 0.12,
        opacity: 0.06,
      },
      [img(mark, size, size * MARK_RATIO)],
    );
  }

  private vertical(
    config: ShareConfig,
    payload: SharePayload,
    displayUrl: string,
    story: boolean,
    assets: { logo: string; mark: string },
  ): El {
    const primary = config.brand.primary;
    const logoW = 340;
    return el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: config.brand.background,
        padding: story ? "170px 90px" : "64px 90px",
        fontFamily: "Manrope",
        position: "relative",
      },
      [
        this.watermark(assets.mark, story ? 620 : 520),
        // Top brand accent bar
        el("div", {
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 16,
          backgroundColor: primary,
        }),
        img(assets.logo, logoW, logoW * LOGO_RATIO),
        el(
          "div",
          {
            display: "flex",
            marginTop: story ? 66 : 26,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: INK,
          },
          payload.journeyName.toUpperCase(),
        ),
        el(
          "div",
          {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: story ? 90 : 34,
          },
          this.scoreBlock(config, payload, primary, story ? 1 : 0.92),
        ),
        el(
          "div",
          { display: "flex", flexDirection: "column", alignItems: "center" },
          this.ctaBlock(
            config,
            primary,
            displayUrl,
            story ? 1 : 0.92,
            story ? 92 : 42,
          ),
        ),
      ],
    );
  }

  private horizontal(
    config: ShareConfig,
    payload: SharePayload,
    displayUrl: string,
    assets: { logo: string; mark: string },
  ): El {
    const primary = config.brand.primary;
    const scale = 0.66;
    const logoW = 250;
    return el(
      "div",
      {
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: config.brand.background,
        fontFamily: "Manrope",
        position: "relative",
      },
      [
        this.watermark(assets.mark, 430),
        el("div", {
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 12,
          backgroundColor: primary,
        }),
        // Left: brand + tagline + CTA
        el(
          "div",
          {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "50%",
            height: "100%",
            padding: "50px 30px 50px 70px",
          },
          [
            img(assets.logo, logoW, logoW * LOGO_RATIO),
            el(
              "div",
              {
                display: "flex",
                marginTop: 30,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: INK,
              },
              payload.journeyName.toUpperCase(),
            ),
            el(
              "div",
              {
                display: "flex",
                marginTop: 28,
                fontSize: 30,
                fontWeight: 400,
                color: INK,
                maxWidth: 430,
              },
              `“${config.card.tagline}”`,
            ),
            el(
              "div",
              {
                display: "flex",
                marginTop: 26,
                padding: "12px 30px",
                borderRadius: 999,
                backgroundColor: SOFT_BLUE,
                fontSize: 24,
                fontWeight: 800,
                color: primary,
              },
              config.card.cta,
            ),
            el(
              "div",
              {
                display: "flex",
                marginTop: 22,
                fontSize: 20,
                fontWeight: 400,
                color: MUTED,
              },
              displayUrl,
            ),
          ],
        ),
        // Right: score
        el(
          "div",
          {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
            height: "100%",
            padding: 40,
          },
          this.scoreBlock(config, payload, primary, scale),
        ),
      ],
    );
  }

  async render(
    config: ShareConfig,
    payload: SharePayload,
    displayUrl: string,
    format: ShareCardFormat,
  ): Promise<Buffer> {
    const { width, height } = FORMATS[format];
    const assets = this.loadAssets();
    const tree =
      format === "landscape"
        ? this.horizontal(config, payload, displayUrl, assets)
        : this.vertical(config, payload, displayUrl, format === "story", assets);

    const svg = await satori(tree as never, {
      width,
      height,
      fonts: this.loadFonts().map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight as 400,
        style: "normal" as const,
      })),
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
      background: config.brand.background,
    });
    return resvg.render().asPng();
  }
}
