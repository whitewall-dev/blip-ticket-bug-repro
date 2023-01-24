import http from 'node:http'

const testWaitingTicket = false

http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
        body += chunk
    })
    req.on('end', async () => {
        try {

            const json = JSON.parse(body)
            if (json.type === 'application/vnd.iris.ticket+json') {
                const ticketid = json.content.id
                console.log(`Ticket ${ticketid} created`)

                if (testWaitingTicket) {
                    setTimeout(async () => {
                        const result = await fetch('https://http.msging.net/commands', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Key ' + process.env.BOT_KEY,
                            },
                            body: JSON.stringify({
                                "id": Date.now().toString(),
                                "to": "postmaster@desk.msging.net",
                                "method": "set",
                                "uri": "/tickets/change-status",
                                "type": "application/vnd.iris.ticket+json",
                                "resource": {
                                    "id": ticketid,
                                    "status": "Open",
                                    "agentIdentity": Date.now().toString()
                                }
                            })
                        })

                        console.log(await result.json())
                    }, 100);
                }
            } else if (json.type === 'text/plain') {
                console.log(`Text message received on ${json.from.replace('@desk.msging.net/Webhook', '')}: ${json.content}`)
            } else {
                console.log('Unknown event type: ' + json.type)
            }

            res.writeHead(200)
            res.end()
        } catch (e) {
            console.error(e)

            res.writeHead(500)
            res.end('Error: ' + e.message)
        }
    })
}).listen(8000)