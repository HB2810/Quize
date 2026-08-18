import { Module } from "@nestjs/common";
import {
  RecognitionDisplayController,
  RecognitionSessionController,
} from "./recognition.controller";
import { RecognitionService } from "./recognition.service";

/**
 * Recognition domain: 6/6 eligibility, separate public-display
 * consent, private selfie storage, and the OPD display feed. Only
 * selfie + chosen display name + achievement ever leave this module
 * publicly.
 */
@Module({
  controllers: [RecognitionSessionController, RecognitionDisplayController],
  providers: [RecognitionService],
  exports: [RecognitionService],
})
export class RecognitionModule {}
