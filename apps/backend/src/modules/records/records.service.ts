import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateRecordDto } from "./dto/create-record.dto";

@Injectable()
export class RecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(dto: CreateRecordDto) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity || activity.companyId !== dto.companyId) {
      throw new BadRequestException("L'activite ne correspond pas a l'entreprise");
    }

    const record = {
      id: `record-${Date.now()}`,
      companyId: dto.companyId,
      activityId: dto.activityId,
      title: dto.title,
      reference: dto.reference,
      amount: dto.amount,
      status: dto.status,
      payload: dto.payload ? JSON.parse(dto.payload) : {},
      createdAt: new Date().toISOString(),
    };

    this.realtimeGateway.broadcastRecordCreated(record);

    return record;
  }

  findByActivity(activityId: string) {
    return [];
  }
}
