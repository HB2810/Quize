import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import {
  RecognitionConsentRequestSchema,
  type DisplayFeed,
  type RecognitionActionResponse,
  type RecognitionConsentRequest,
} from "@stavya/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { Env } from "../../config/env.schema";
import { RecognitionService } from "./recognition.service";

@Controller("sessions/:id/recognition")
export class RecognitionSessionController {
  constructor(private readonly recognition: RecognitionService) {}

  @Post("consent")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async consent(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(RecognitionConsentRequestSchema))
    body: RecognitionConsentRequest,
  ): Promise<RecognitionActionResponse> {
    return {
      recognition: await this.recognition.consent(
        id,
        body.granted,
        body.displayNameChoice,
      ),
    };
  }

  @Post("selfie")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseInterceptors(FileInterceptor("photo"))
  async uploadSelfie(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<RecognitionActionResponse> {
    return { recognition: await this.recognition.uploadSelfie(id, file) };
  }

  @Get("selfie")
  @Header("Content-Type", "image/jpeg")
  @Header("Cache-Control", "private, no-store")
  async ownSelfie(@Param("id") id: string, @Res() res: Response) {
    res.send(await this.recognition.getOwnSelfie(id));
  }

  @Post("publish")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async publish(@Param("id") id: string): Promise<RecognitionActionResponse> {
    return { recognition: await this.recognition.publish(id) };
  }
}

@Controller("recognition")
export class RecognitionDisplayController {
  constructor(
    private readonly recognition: RecognitionService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get("display")
  displayFeed(): Promise<DisplayFeed> {
    return this.recognition.displayFeed(
      this.config.get("API_PUBLIC_URL", { infer: true }),
    );
  }

  @Get("display/:recognitionId/photo")
  @Header("Content-Type", "image/jpeg")
  @Header("Cache-Control", "public, max-age=300")
  async photo(
    @Param("recognitionId") recognitionId: string,
    @Res() res: Response,
  ) {
    res.send(await this.recognition.getPublishedPhoto(recognitionId));
  }
}
