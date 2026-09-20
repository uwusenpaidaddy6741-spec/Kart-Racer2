export default {

    async fetch(request, env) {

        const url =
            new URL(request.url);


        // ====================================================
        // GET LEADERBOARD
        // ====================================================

        if (
            request.method === "GET" &&
            url.pathname === "/leaderboard"
        ) {

            const track =
                url.searchParams.get(
                    "track"
                );


            if (!track) {

                return new Response(
                    JSON.stringify({
                        error:
                            "Missing track"
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );
            }


            const results =
                await env.DB
                    .prepare(`
                        SELECT
                            id,
                            name,
                            time
                        FROM leaderboard
                        WHERE track = ?
                        ORDER BY time ASC
                        LIMIT 10
                    `)
                    .bind(track)
                    .all();


            return new Response(
                JSON.stringify(
                    results.results
                ),
                {
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        // ====================================================
        // SUBMIT TIME
        // ====================================================

        if (
            request.method === "POST" &&
            url.pathname === "/leaderboard"
        ) {

            const body =
                await request.json();


            if (
                !body.name ||
                !body.track ||
                typeof body.time !==
                    "number"
            ) {

                return new Response(
                    JSON.stringify({
                        error:
                            "Invalid submission"
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );
            }


            await env.DB
                .prepare(`
                    INSERT INTO leaderboard
                    (
                        track,
                        name,
                        time
                    )
                    VALUES (?, ?, ?)
                `)
                .bind(
                    body.track,
                    body.name,
                    body.time
                )
                .run();


            return new Response(
                JSON.stringify({
                    success: true
                }),
                {
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        return new Response(
            "Kart Racer API"
        );
    }

};
