// Aggregate tất cả config để import một lần
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import stripeConfig from './stripe.config';

export { appConfig, databaseConfig, jwtConfig, redisConfig, stripeConfig };

export const allConfigs = [appConfig, databaseConfig, jwtConfig, redisConfig, stripeConfig];
