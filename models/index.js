const { DataTypes } = require('sequelize');
const { hashSync } = require('bcryptjs');
const sequelize = require('../utils/sequilize');
const notificationService = require('../services/notificationService');
const firebaseApp = require('../config/firebase');

const Actor = sequelize.define(
  'Actor',
  {
    // attributes

    description: DataTypes.STRING,
    imageURL: DataTypes.STRING,
  },
  { freezeTableName: true },
);
const Character = sequelize.define(
  'Character',
  {
    // attributes
    name: {
      type: DataTypes.STRING,
    },
    descriptionFileURL: DataTypes.STRING,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { freezeTableName: true },
);
const Equipment = sequelize.define(
  'Equipment',
  {
    // attributes
    name: {
      type: DataTypes.STRING,
    },
    description: DataTypes.STRING,
    imageURL: DataTypes.STRING,
    status: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { freezeTableName: true },
);
const Scence = sequelize.define(
  'Scence',
  {
    // attributes
    name: {
      type: DataTypes.STRING,
    },
    description: DataTypes.STRING,
    filmingAddress: DataTypes.STRING,
    filmingStartDate: DataTypes.DATE,
    filmingEndDate: DataTypes.DATE,
    setQuantity: DataTypes.INTEGER,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { freezeTableName: true },
);

const Token = sequelize.define(
  'Token',
  {
    // attributes
    token: {
      type: DataTypes.STRING,
    },
  },
  { freezeTableName: true },
);

const User = sequelize.define(
  'User',
  {
    // attributes
    username: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['male', 'female', 'others']],
          msg: 'Gender must be one of male, female or others',
        },
      },
    },
    phone: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      set(value) {
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue('password', hashSync(value));
      },
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['admin', 'actor']],
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
    indexes: [{ unique: true, fields: ['username'] }],
  },
);

const ActorCharactor = sequelize.define(
  'ActorCharactor',
  {},
  {
    freezeTableName: true,
    hooks: {
      afterCreate: async (actorCharactor, options) => {
        const actorId = actorCharactor.get({ plain: true }).ActorId;
        const characterId = actorCharactor.get({ plain: true }).CharacterId;
        const scence = await Scence.findOne({
          include: [
            {
              model: Character,
              where: {
                id: characterId,
              },
            },
          ],
        });
        console.log('actorId, characterId', actorId, characterId);
        console.log('afterCreate ', scence);
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
                title: 'Ban da nhan duoc vai dien moi',
                body: `Character Id ${characterId}`,
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
          console.log('err', err);
        }
        // await notificationService.sendNotificationToActor({
        //   actorId,
        //   title: 'Ban da nhan duoc vai dien moi',
        //   content: `Character Id ${characterId}`,
        // });
      },
      afterUpdate: async (actorCharactor, options) => {
        const actorId = actorCharactor.get({ plain: true }).ActorId;
        const characterId = actorCharactor.get({ plain: true }).CharacterId;
        const scence = await Scence.findOne({
          include: [
            {
              model: Character,
              where: {
                id: characterId,
              },
            },
          ],
        });
        console.log('actorId, characterId', actorId, characterId);
        console.log('afterUpdate ', scence);
        // await notificationService.sendNotificationToActor({
        //   actorId,
        //   title: 'Ban da nhan duoc vai dien moi',
        //   content: `Character Id ${characterId}`,
        // });
      },
      afterDestroy: async (actorCharactor, options) => {
        const actorId = actorCharactor.get({ plain: true }).ActorId;
        const characterId = actorCharactor.get({ plain: true }).CharacterId;
        const scence = await Scence.findOne({
          include: [
            {
              model: Character,
              where: {
                id: characterId,
              },
            },
          ],
        });
        console.log('actorId, characterId', actorId, characterId);
        console.log('afterDestroy ', scence);
        // await notificationService.sendNotificationToActor({
        //   actorId,
        //   title: 'Vai dien da duoc huy bo',
        //   content: `Character Id ${characterId}`,
        // });
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
                title: 'Vai dien da duoc huy bo',
                body: `Character Id ${characterId}`,
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
          console.log('err', err);
        }
      },
      // afterBulkCreate: (models, options) => {
      //   console.log('afterBulkCreate', models, options);
      // },
    },
  },
);
const ScenceEquipment = sequelize.define(
  'ScenceEquipment',
  {
    quantity: DataTypes.INTEGER,
  },
  { freezeTableName: true },
);

const configModel = async () => {
  Scence.belongsToMany(Equipment, { through: ScenceEquipment });
  Equipment.belongsToMany(Scence, { through: ScenceEquipment });

  User.hasOne(Actor);
  Actor.belongsTo(User);

  User.hasMany(Token);
  Token.belongsTo(User);

  Scence.hasMany(Character);
  Character.belongsTo(Scence);

  Actor.belongsToMany(Character, { through: ActorCharactor });
  Character.belongsToMany(Actor, { through: ActorCharactor });

  await sequelize.sync();

  // await User.sync({ force: true });
  // await Scence.sync({ force: true });
  // await Actor.sync({ force: true });
  // await Character.sync({ force: true });
  // await Equipment.sync({ force: true });
  // await Token.sync({ force: true });
  // await ActorCharactor.sync({ force: true });
  // await ScenceEquipment.sync({ force: true });
};

module.exports = {
  configModel,
  User,
  Token,
  Scence,
  Equipment,
  Character,
  Actor,
  ActorCharactor,
  ScenceEquipment,
};
