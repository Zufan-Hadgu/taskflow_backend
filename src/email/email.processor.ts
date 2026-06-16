import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Job } from "bullmq";
import { EmailService } from "./email.service";



@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    switch (job.name) {
      case 'welcome-email':
        await this.sendWelcomeEmail(job);
        break;
    }
  }

  private async sendWelcomeEmail(
    job: Job,
  ): Promise<void> {
    await this.emailService.sendWelcomeEmail(
      job.data.email,
    );
  }
}