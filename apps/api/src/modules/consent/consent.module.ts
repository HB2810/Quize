import { Module } from "@nestjs/common";

/**
 * Consent domain: per-type consent records (COMMUNICATION vs
 * PUBLIC_RECOGNITION — never a single "I agree"), tracking the wording
 * version shown. Built out in Foundation 11.
 */
@Module({})
export class ConsentModule {}
