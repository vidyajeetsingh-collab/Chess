export default async () => {

  return new Response(
    JSON.stringify({
      ok: true,
      service: "LIFELOOP",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};