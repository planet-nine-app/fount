import db from '../persistence/db.js';

const user = {
  getUser: async (uuid) => {
    const foundUser = await db.getUser(uuid);
    return foundUser;
  },

  putUser: async (newUser) => {
    const uuid = await db.putUser(newUser);

    newUser.uuid = uuid;

    return newUser;
  },

  deleteUser: async (userToDelete) => {
    return (await db.deleteUser(userToDelete));
  }
};

export default user;
