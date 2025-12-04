import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private repo: Repository<Message>,
    private readonly notifService: NotificationsService,
  ) {}

  async sendMessage(senderId: string, dto: CreateMessageDto) {
    const msg = this.repo.create({
      senderId,
      receiverId: dto.receiverId,
      content: dto.content,
    });
    return this.repo.save(msg);

    await this.notifService.create(
      dto.receiverId, 
      `Tienes un nuevo mensaje privado: "${dto.content.substring(0, 30)}${dto.content.length > 30 ? '...' : ''}"`
    );

  }

  async getConversation(userId1: string, userId2: string) {
    return this.repo.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }

  async getMyContacts(myUserId: string) {
    const messages = await this.repo.find({
      where: [{ senderId: myUserId }, { receiverId: myUserId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    const contacts = new Map();
    messages.forEach((msg) => {
      const otherUser = msg.senderId === myUserId ? msg.receiver : msg.sender;
      if (!contacts.has(otherUser.id)) {
        contacts.set(otherUser.id, {
          ...otherUser,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
        });
      }
    });

    return Array.from(contacts.values());
  }
}