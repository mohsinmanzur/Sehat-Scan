import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { HealthMeasurementService } from '../health_measurement/health_measurement.service';
import { Measurement_Unit } from '../entities/measurement_unit.entity';

export type ExtractedMeasurement = {
  matched_unit: Measurement_Unit | null;
  numeric_value: number;
  numeric_value_2: number | null;
  confidence: number;
};

export type ExtractionResult = {
  record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
  date_issued: string | null;
  notes: string | null;
  measurements: ExtractedMeasurement[];
};

const RECORD_TYPES = ['lab_report', 'prescription', 'imaging', 'other'] as const;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: GoogleGenAI | null = null;

  constructor(private readonly healthMeasurementService: HealthMeasurementService) {}

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured on the server.');
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  private buildPrompt(units: Measurement_Unit[]): string {
    const unitLines = units
      .map(
        (u) =>
          `- ${u.unit_name} (symbol: ${u.symbol}, group: ${u.measurement_group}${u.has_secondary_value ? ', two-part reading e.g. systolic/diastolic' : ''
          })`,
      )
      .join('\n');

    return `You are extracting health measurement readings from a photo of a medical document (lab report, prescription, or device screen/printout) for a patient health-tracking app.

The app only supports these measurement types. Attribute every relevant number you find on the document to the closest matching type below, using its exact unit_name:
${unitLines}

For each reading found:
- Set unit_name to the exact matching name from the list above.
- Put the main reading in numeric_value.
- Only set numeric_value_2 for two-part readings (e.g. Blood Pressure systolic/diastolic: systolic -> numeric_value, diastolic -> numeric_value_2).
- Set confidence from 0 to 1 for how sure you are this reading and type are correct.

Do not invent numbers that are not visible in the image, and do not include a measurement whose type isn't in the list above.

Also identify:
- record_type: the kind of document this is.
- date_issued: the date the report/reading was taken or issued, as an ISO date (YYYY-MM-DD), if visible.
- notes: a short plain-text summary of other relevant context on the document (e.g. lab/clinic name, doctor, medication names) — omit if there's nothing useful beyond the readings themselves.`;
  }

  async extractMeasurementsFromImage(file: Express.Multer.File): Promise<ExtractionResult> {
    const units = await this.healthMeasurementService.getUnits();
    if (units.length === 0) {
      throw new InternalServerErrorException('No measurement units are configured.');
    }

    const unitNames = units.map((u) => u.unit_name);
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        record_type: {
          type: Type.STRING,
          enum: [...RECORD_TYPES],
        },
        date_issued: {
          type: Type.STRING,
          nullable: true,
          description: 'ISO date (YYYY-MM-DD) the report/reading was taken or issued, if visible.',
        },
        notes: {
          type: Type.STRING,
          nullable: true,
        },
        measurements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              unit_name: {
                type: Type.STRING,
                enum: unitNames,
              },
              numeric_value: { type: Type.NUMBER },
              numeric_value_2: { type: Type.NUMBER, nullable: true },
              confidence: { type: Type.NUMBER },
            },
            required: ['unit_name', 'numeric_value', 'confidence'],
          },
        },
      },
      required: ['record_type', 'measurements'],
    };

    let responseText: string | undefined;
    try {
      const response = await this.getClient().models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: this.buildPrompt(units) },
              { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });
      responseText = response.text;
    } catch (error) {
      this.logger.error('Gemini extraction request failed', error);
      throw new InternalServerErrorException('AI extraction request failed.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText ?? '{}');
    } catch (error) {
      this.logger.error(`Failed to parse Gemini response as JSON: ${responseText}`);
      throw new InternalServerErrorException('AI extraction returned an unparseable response.');
    }

    const unitsByName = new Map(units.map((u) => [u.unit_name, u]));
    const rawMeasurements: any[] = Array.isArray(parsed.measurements) ? parsed.measurements : [];

    const measurements: ExtractedMeasurement[] = rawMeasurements
      .filter((m) => typeof m?.numeric_value === 'number')
      .map((m) => {
        const matched_unit = unitsByName.get(m.unit_name) ?? null;
        if (!matched_unit) {
          this.logger.warn(`Gemini returned unrecognized unit_name "${m.unit_name}" — dropping reading.`);
        }
        return {
          matched_unit,
          numeric_value: m.numeric_value,
          numeric_value_2: typeof m.numeric_value_2 === 'number' ? m.numeric_value_2 : null,
          confidence: typeof m.confidence === 'number' ? m.confidence : 0,
        };
      })
      .filter((m) => m.matched_unit !== null);

    return {
      record_type: RECORD_TYPES.includes(parsed.record_type) ? parsed.record_type : 'other',
      date_issued: typeof parsed.date_issued === 'string' ? parsed.date_issued : null,
      notes: typeof parsed.notes === 'string' ? parsed.notes : null,
      measurements,
    };
  }
}
