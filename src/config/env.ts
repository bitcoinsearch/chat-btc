interface EnvVars {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  DB_NAME: string

  OPENAI_MODEL: string;
  OPENAI_API_KEY: string;

  ES_URL: string;
  ES_AUTHORIZATION_TOKEN: string;
  ES_USERNAME: string;
  ES_PASSWORD: string;
  ES_CLOUD_ID: string;
  ES_INDEX: string;
  ES_INDEX_CORE: string;


  MACAROON: string;
  LND_URL: string;
  JWT_SECRET: string;
  PRODUCTION: boolean;
}

let envVars: EnvVars | undefined;

function getEnvVars(): EnvVars {
  if (!envVars) {
    const tempEnvVars: EnvVars = {
      SUPABASE_URL: process.env.SUPABASE_URL ?? "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
      DB_NAME: process.env.DB_NAME ?? "",
      OPENAI_MODEL: process.env.OPENAI_MODEL ?? "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      ES_URL: process.env.ES_URL ?? "",
      ES_AUTHORIZATION_TOKEN: process.env.ES_AUTHORIZATION_TOKEN ?? "",
      ES_USERNAME: process.env.ES_USERNAME ?? "",
      ES_PASSWORD: process.env.ES_PASSWORD ?? "",
      ES_CLOUD_ID: process.env.ES_CLOUD_ID ?? "",
      ES_INDEX: process.env.ES_INDEX ?? "",
      ES_INDEX_CORE: process.env.ES_INDEX_CORE ?? "",
      MACAROON: process.env.MACAROON ?? "",
      LND_URL: process.env.LND_URL ?? "",
      PRODUCTION: process.env.NODE_ENV === "production",
      JWT_SECRET: process.env.JWT_SECRET ?? ""
    };

    const missingEnvVars: string[] = [];

    Object.keys(tempEnvVars).forEach((key) => {
      const entry = tempEnvVars[key as keyof EnvVars]
      const isInvalid = entry === "" || entry === null || entry === undefined
      if (isInvalid) {
        missingEnvVars.push(key);
      }
    });

    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    envVars = tempEnvVars;
  }

  return envVars;
}

export const ENV = getEnvVars();