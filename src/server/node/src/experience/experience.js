import db from '../persistence/db.js';

const experienceToMPRatio = 15; // One more magic number. You need to gate the granting of experience
                                // so people don't just give themselves tons of experience, and you do this
                                // by making people spend MP to grant it

const experience = {
  grant: (sourceUser, destinationUser, amount) => {
    if(amount > sourceUser.mp * experienceToMPRatio) {
      return sourceUser;
    }
    sourceUser.mp -= Math.ceil(amount / experienceToMPRatio); // might need to think about this
    destinationUser.experiencePool += amount;
    await db.saveUser(destinationUser);
    const updatedUser = await db.saveUser(sourceUser);
    
    return updatedUser;
  }
};

export default experience;
