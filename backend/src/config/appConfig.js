export const appConfig = {
  apiPrefix: "/api/v1",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://127.0.0.1:5173",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 8080),
};
