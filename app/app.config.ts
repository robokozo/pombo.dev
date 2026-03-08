// defineAppConfig is an identity function used for type inference.
// It is defined here because imports.autoImport: false prevents Nuxt
// from injecting it, and unimport does not transform app.config.ts.
const defineAppConfig = <T>(config: T): T => config;

export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      neutral: "zinc",
    },
  },
});
