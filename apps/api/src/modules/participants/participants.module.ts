import { Module } from "@nestjs/common";

/**
 * Participant domain: the ONLY module allowed to read/write PII
 * (name, mobile, email). Controlled access; contact details are never
 * exposed publicly. Built out in Foundation 11.
 */
@Module({})
export class ParticipantsModule {}
