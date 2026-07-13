export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return new Response("Not Found", { status: 404 });
  },
};
