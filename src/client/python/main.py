from sessionless import SessionlessSecp256k1
import time
import requests

async def register():
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    private_key, public_key = sessionless.generateKeys(saveKey)

    message = f'{timestamp}{public_key}'

    signature = await sessionless.sign(message.encode('ascii'), get_key)

    payload = {
        "timestamp": timestamp,
        "pubKey": public_key
    }

    headers = {'content-type': 'application/json'}
    response = requests.post('http://127.0.0.1:3000/user/create', headers=headers, json=payload)

    return response
