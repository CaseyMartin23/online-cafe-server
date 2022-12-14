import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  public async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel({
      ...createUserDto,
      isAdmin: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    return await createdUser.save();
  }

  public async findAll() {
    return await this.userModel.find();
  }

  public async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  public async findByEmail(email: string) {
    if(!email) return null;
    return await this.userModel.findOne({ email });
  }

  public async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, {
      $set: {
        ...updateUserDto,
        dateUpdated: new Date()
      }
    })
  }

}
