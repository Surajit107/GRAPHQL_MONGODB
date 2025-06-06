import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../schemas/user.schema';
import { CreateUserInput, UpdateUserInput } from '../dto/user.input.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findOne(user._id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ) {
    // Ensure user can only update their own profile
    if (user._id.toString() !== id) {
      throw new UnauthorizedException('Cannot update another user');
    }
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async removeUser(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: User) {
    // Ensure user can only delete their own account
    if (user._id.toString() !== id) {
      throw new UnauthorizedException('Cannot delete another user');
    }
    return this.usersService.remove(id);
  }
} 