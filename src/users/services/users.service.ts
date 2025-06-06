import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { CreateUserInput } from '../dto/user.input.dto';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: LoggerService,
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
      const createdUser = new this.userModel({
        ...createUserInput,
        password: hashedPassword,
      });
      return createdUser.save();
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return this.userModel.find().exec();
    } catch (error) {
      this.logger.error('Error finding all users', error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user with ID ${id}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(`Error finding user with email ${email}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user with ID ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return deletedUser;
    } catch (error) {
      this.logger.error(`Error deleting user with ID ${id}`, error.stack);
      throw error;
    }
  }
} 