/* eslint-disable no-useless-catch */
/* eslint-disable class-methods-use-this */
const {
  Scence,
  Character,
  Actor,
  ActorCharactor,
  Equipment,
  User,
} = require('../models/index');
const sequelize = require('../utils/sequilize');

class AdminService {
  setUser(user) {
    this.user = user;
  }

  async getAllScences() {
    const scences = await Scence.findAll();

    return scences;
  }

  async getScenceById(id) {
    const scenceDetail = await Scence.findOne({
      where: {
        id,
        isDeleted: false,
      },
      include: [
        {
          // required: true,
          model: Character,
          include: [
            {
              model: Actor,
              include: [
                {
                  model: User,
                  // through: {
                  //   attributes: ['name', 'username', 'role', 'gender'],
                  // },
                },
              ],
              through: {
                attributes: [],
              },
            },
          ],
        },
        {
          // required: true,
          model: Equipment,
          through: {
            attributes: [],
          },
        },
      ],
    });
    return scenceDetail;
  }

  // #region Actor
  async getActors() {
    const actors = await Actor.findAll({
      include: [
        {
          required: true,
          model: User,
          where: {
            isDeleted: false,
          },
        },
      ],
    });
    const nomarlizeActorList = actors.map((actor) => {
      // console.log('actor', actor);
      // console.log('actor.User', actor.User);
      return {
        id: actor.id,
        description: actor.description,
        imageURL: actor.imageURL,
        username: actor.User.username,
        gender: actor.User.gender,
        phone: actor.User.phone,
        name: actor.User.name,
        createdAt: actor.createdAt,
        updatedAt: actor.updatedAt,
      };
    });

    return nomarlizeActorList;
  }

  async createActor({
    username,
    password,
    description,
    imageURL,
    gender,
    phone,
    name,
  }) {
    // check required input
    if (!username || !password || !name || !gender)
      throw new Error('Invalid Input');

    // check whether has user with that email
    const user = await User.findOne({
      where: { username },
    });

    if (user) throw new Error('That email is already taken!');

    try {
      const result = await sequelize.transaction(async (t) => {
        const createdUser = await User.create({
          role: 'actor',
          username,
          password,
          gender,
          phone,
          name,
        });
        if (!createdUser) {
          throw new Error('Error when creating user');
        }

        const createdActor = await Actor.create({
          description,
          imageURL,
          UserId: createdUser.id,
        });

        return {
          id: createdActor.id,
          username: createdUser.username,
          description: createdActor.description,
          imageURL: createdActor.imageURL,
          gender: createdUser.gender,
          phone: createdUser.phone,
          name: createdUser.name,
        };
      });

      // If the execution reaches this line, the transaction has been committed successfully
      // `result` is whatever was returned from the transaction callback (the `user`, in this case)
      return result;
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      throw error;
    }
  }

  async updateActor({
    id,
    password,
    description,
    imageURL,
    gender,
    phone,
    name,
  }) {
    // check required input
    if (!id || !password || !name || !gender) {
      throw new Error('Invalid Input');
    }

    // check whether has user with that email
    const actor = await Actor.findOne({
      where: {
        id,
      },
      include: [
        {
          required: true,
          model: User,
          where: {
            isDeleted: false,
          },
        },
      ],
    });

    if (!actor) throw new Error('Not found that actor!');

    try {
      const result = await sequelize.transaction(async (t) => {
        const user = await User.findOne({
          where: {
            id: actor.User.id,
          },
        });
        if (!actor) {
          throw new Error('Not found that actor!');
        }
        const updatedUser = await user.update({
          password,
          gender,
          phone,
          name,
        });
        if (!updatedUser) {
          throw new Error('Error when update user');
        }

        const updatedActor = await actor.update({
          description,
          imageURL,
        });

        return {
          id: updatedActor.id,
          username: updatedUser.username,
          description: updatedActor.description,
          imageURL: updatedActor.imageURL,
          gender: updatedUser.gender,
          phone: updatedUser.phone,
          name: updatedUser.name,
        };
      });

      // If the execution reaches this line, the transaction has been committed successfully
      // `result` is whatever was returned from the transaction callback (the `user`, in this case)
      return result;
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      throw error;
    }
  }

  async deleteActor(actorId) {
    const actor = await Actor.findByPk(actorId);
    if (!actor) throw new Error('Not found that actor');
    const user = await User.findOne({
      where: {
        id: actor.UserId,
      },
    });
    console.log('Deleted: ', user.id);

    const deletedUser = await user.update({
      isDeleted: true,
    });
    return actor.id;
  }

  // #endregion

  // #region Equipment

  async getEquipments({ status, fromDate, toDate }) {
    const where = {
      isDeleted: false,
    };
    if (status) {
      if (status.toLowerCase() !== 'all') where.status = status;
      // where.
    }
    return Equipment.findAll({ where });
  }

  async createEquipment({ name, description, imageURL, status, quantity }) {
    // check required input
    if (!quantity || !status || !name) throw new Error('Invalid Input');

    try {
      const createdEquipemnt = await Equipment.create({
        name,
        description,
        imageURL,
        status,
        quantity,
      });
      return createdEquipemnt;
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      throw error;
    }
  }

  async updateEquipment({ id, name, description, imageURL, status, quantity }) {
    // check required input
    if (!quantity || !status || !name || !id) throw new Error('Invalid Input');

    try {
      const equipment = await Equipment.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });
      if (!equipment) throw new Error('Cannot found that equipment');

      const updatedEquipemnt = await equipment.update({
        name,
        description,
        imageURL,
        status,
        quantity,
      });

      return updatedEquipemnt;
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      throw error;
    }
  }

  async deleteEquipment(equipmentId) {
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) throw new Error('Not found that equipment');

    const deletedEquipment = await equipment.update({
      isDeleted: true,
    });
    return deletedEquipment.id;
  }

  // #endregion

  // #region CRUD Scence

  async createScences({
    name,
    description,
    filmingAddress,
    filmingStartDate,
    filmingEndDate,
    setQuantity,
  }) {
    if (
      !(
        name ||
        description ||
        filmingAddress ||
        filmingStartDate ||
        filmingEndDate ||
        setQuantity
      )
    ) {
      throw new Error('Not valid input');
    }

    const createdScence = await Scence.create(
      {
        name,
        description,
        filmingAddress,
        filmingStartDate,
        filmingEndDate,
        setQuantity,
      },
      {},
    );

    return createdScence;
  }

  async updateScenceById(
    scenceId,
    {
      name,
      description,
      filmingAddress,
      filmingStartDate,
      filmingEndDate,
      setQuantity,
    },
  ) {
    const scence = await Scence.findByPk(scenceId);
    if (!scence) throw new Error('Not founded that scence');

    const updateResult = await Scence.update(
      {
        name,
        description,
        filmingAddress,
        filmingStartDate,
        filmingEndDate,
        setQuantity,
      },
      {
        where: {
          id: scenceId,
        },
        returning: true,
      },
    );

    return updateResult[1][0];
  }

  async deleteScenceById(scenceId) {
    const scence = await Scence.findByPk(scenceId);
    if (!scence) throw new Error('Not founded that scence');

    const updateResult = await Scence.destroy({
      where: {
        id: scenceId,
      },
    });

    return updateResult;
  }

  // #endregion

  // #region CRUD Scence's Equipment

  // #endregion

  // #region CRUD Scence's Character
  async getCharacterOfScences(scenceId) {
    const { Characters } = await Scence.findByPk(scenceId, {
      include: Character,
    });
    return Characters;
  }

  async createCharacterInScence(
    scenceId,
    { name, descriptionFileURL, actorId },
  ) {
    const createdCharacter = await Character.create({
      name,
      descriptionFileURL,
      ScenceId: scenceId,
    });

    const result = await ActorCharactor.create({
      CharacterId: createdCharacter.id,
      ActorId: actorId,
    });

    return createdCharacter;
  }
  // #endregion
}

const adminService = new AdminService();

module.exports = adminService;
