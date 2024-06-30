import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabaseClient';

@Injectable()
export class ImageService {
  constructor() {}

  async upload(role: string, id: string, imageBuffer: Buffer, imageName: string) {
    const { data, error } = await supabase.storage
      .from('authgateimages')
      .upload(`${role}/${id}/${imageName}`, imageBuffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return error;
    }

    return data;
  }
}
