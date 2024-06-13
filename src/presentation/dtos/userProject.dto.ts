import { IsDate, IsEmail, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class userProjectModel {
  @IsString()
  projectID: ObjectId;

  @IsString()
  authorizationCode: string;

  @IsString()
  authorizationAccessToken: string;

  @IsDate()
  expireDate: Date;
}
