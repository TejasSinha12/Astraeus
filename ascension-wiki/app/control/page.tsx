// Force this page to be server-rendered (not statically pre-rendered)
// Required because Clerk needs a real request context to validate auth
export const dynamic = "force-dynamic";

export { default } from "./_control";
