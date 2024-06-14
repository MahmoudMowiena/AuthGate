import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { supabase } from '../supabase/supabaseClient';
import { User } from 'src/domain/entities/user.entity';
import { Express } from 'express';

@Injectable()
export class ImageService {
  constructor() {}

  async upload(role: string, id: string, image: Express.Multer.File) {
    const { data, error } = await supabase.storage
      .from('authgateimages')
      .upload(`${role}/${id}/${image.originalname}`, image.buffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return error;
    }

    return data;
  }
}
