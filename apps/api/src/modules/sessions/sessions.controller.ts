import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ContactRequestSchema,
  CreateSessionRequestSchema,
  SubmitStepRequestSchema,
  type ContactRequest,
  type CreateSessionRequest,
  type SessionResponse,
  type SubmitStepRequest,
  type SubmitStepResponse,
} from "@stavya/contracts";
import type { CreateShareResponse } from "@stavya/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ShareService } from "../share/share.service";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly share: ShareService,
  ) {}

  /** Explicit share action — never automatic. Idempotent per session. */
  @Post(":id/share")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  createShare(@Param("id") id: string): Promise<CreateShareResponse> {
    return this.share.createForSession(id);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(
    @Body(new ZodValidationPipe(CreateSessionRequestSchema))
    body: CreateSessionRequest,
  ): Promise<SessionResponse> {
    return this.sessions.create(body.journeySlug);
  }

  @Get(":id/step")
  getStep(@Param("id") id: string): Promise<SessionResponse> {
    return this.sessions.getStep(id);
  }

  @Post(":id/step")
  submitStep(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(SubmitStepRequestSchema))
    body: SubmitStepRequest,
  ): Promise<SubmitStepResponse> {
    return this.sessions.submitStep(id, body);
  }

  @Post(":id/contact")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  submitContact(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(ContactRequestSchema))
    body: ContactRequest,
  ): Promise<SubmitStepResponse> {
    return this.sessions.submitContact(id, body);
  }
}
