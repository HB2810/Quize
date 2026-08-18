import { Module } from "@nestjs/common";

/**
 * Auth domain: admin authentication (hashed credentials, short-lived
 * JWTs) and role-based authorization guards. Participants never log in;
 * their session id is the capability token. Built out in Foundation 13.
 */
@Module({})
export class AuthModule {}
