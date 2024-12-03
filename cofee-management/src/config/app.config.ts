export default () => ({
  environment: process.env.environment || 'development',
  database: {
    host: 'localhost-dima',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
});
