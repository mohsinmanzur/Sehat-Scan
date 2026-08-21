import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService, ExtractionResult } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-measurements')
  @UseInterceptors(FileInterceptor('file'))
  async extractMeasurements(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ExtractionResult> {
    return await this.aiService.extractMeasurementsFromImage(file);
  }
}
