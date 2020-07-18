/* eslint-disable no-useless-catch */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-template */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const firebaseApp = require('../config/firebase');
const { User, Token, Actor } = require('../models');

class NotificationService {
  setUser(user) {
    this.user = user;
  }

  constructor() {
    this.firebaseApp = firebaseApp;
  }

  async sendNotificationToActor({ actorId, content, title }) {
    // get all token from that userID
    try {
      let result;
      const userModel = await User.findOne({
        include: [
          {
            model: Actor,
            required: true,
            where: {
              id: actorId,
            },
          },
          {
            model: Token,
            required: true,
          },
        ],
      });
      if (!userModel) return;
      console.log('gui thong bao user', userModel.get({ plain: true }));
      const userObj = userModel.get({ plain: true });
      const tokens = userObj.Tokens;
      if (tokens.length != 0) {
        const registrationTokens = tokens.map((token) => token.token);
        console.log('registrationTokens', registrationTokens);
        const message = {
          notification: {
            title,
            body: content,
          },
          data: { click_action: 'FLUTTER_NOTIFICATION_CLICK' },
          tokens: registrationTokens,
        };

        const res = await firebaseApp.messaging().sendMulticast(message);
        console.log('Sending notification res', res);
        result = res;
      }
      // eslint-disable-next-line consistent-return
      return result;
    } catch (err) {
      throw err;
    }
  }
  async sendNotificationToUser({ userId, content, title }) {
    // get all token from that userID
    try {
      let result;
      const tokens = await Token.findAll({
        where: {
          UserId: userId,
        },
      });
      console.log('tokens', userId, tokens);
      if (tokens.length != 0) {
        const registrationTokens = tokens.map((token) => token.token);
        console.log('registrationTokens', registrationTokens);
        const message = {
          notification: {
            title,
            body: content,
          },
          data: { click_action: 'FLUTTER_NOTIFICATION_CLICK' },
          tokens: registrationTokens,
        };

        const res = await firebaseApp.messaging().sendMulticast(message);
        console.log('Sending notification res', res);
        result = res;
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}

const notificationService = new NotificationService();
module.exports = notificationService;
