# Football Game Film Analysis Tool
        
Build a product for football coaches to dissect/analyze game film with AI. It will ingest game film and break the film down into component clips (each play is a clip) and then categorize/tag by a variety of different attributes: down and distance, formation, play call, play result. Depending on the situation it will also track blitzes, routes run, blocking schemes, defensive stunts etc. It will allow coaches to easily spot trends in opponent tendencies: things like which situations they're likely to call which plays, what plays they run out of which formations etc. It will allow them to build libraries and segment plays into lists they can share with other coaches, add notes and annotations etc. 

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, request a `pg_dump` from support, upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
