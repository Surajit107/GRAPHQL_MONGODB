import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../schemas/user.schema';
import { CreateUserInput, UpdateUserInput } from '../dto/user.input.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  async findByEmail(@Args('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(`User with email ${email} not found`);
    }
    return user;
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  async removeUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.remove(id);
  }

  @Query(() => Boolean, { name: 'validateUserPassword' })
  async validatePassword(
    @Args('id', { type: () => ID }) id: string,
    @Args('password') password: string,
  ) {
    const user = await this.usersService.findOne(id);
    return this.usersService.validatePassword(user, password);
  }
}