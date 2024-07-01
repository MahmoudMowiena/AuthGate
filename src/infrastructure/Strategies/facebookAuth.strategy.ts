import { AuthService } from './../services/auth.service';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookAuthStrategy extends PassportStrategy(
  Strategy,
  'facebook',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FACEBOOk_CALLBACK_URL'),
      profileFields: ['id', 'name', 'emails', 'photos'],
      scope: ['email'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
  ) {
    const { name, emails, photos } = profile;
    const user = {
      facebookId: profile.id,
      email: emails && emails[0] && emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };

    const existingUser = await this.authService.validateFacebookUser(user);
    if (!existingUser) {
      return done(new UnauthorizedException(), false);
    }
    done(null, existingUser);
  }
}
