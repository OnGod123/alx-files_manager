import dbClient from './utils/db.js';
import redisClient from './utils/redis.js';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            setTimeout(async () => {
                i += 1;
                if (i >= 10) {
                    reject(new Error('MongoDB connection timed out'));
                } else if (!dbClient.isAlive()) {
                    repeatFct();
                } else {
                    resolve();
                }
            }, 1000);
        };
        repeatFct();
    });
};

(async () => {
    
    console.log('MongoDB connection status before wait:', dbClient.isAlive());
    await waitConnection();
    console.log('MongoDB connection status after wait:', dbClient.isAlive());
    console.log('Number of users:', await dbClient.nbUsers());
    console.log('Number of files:', await dbClient.nbFiles());

    
    console.log('Redis connection status:', redisClient.isAlive());
    console.log('Redis value for "myKey":', await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log('Redis value for "myKey" after set:', await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log('Redis value for "myKey" after timeout:', await redisClient.get('myKey'));
    }, 1000 * 10);
})();
