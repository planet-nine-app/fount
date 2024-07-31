from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time
import requests

async def register():
    sessionless = SessionlessSecp256k1()
    private_key, public_key = sessionless.generateKeys(saveKey)

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{public_key}'
    signature = await sessionless.sign(message.encode('ascii'), get_key)

    payload = {
        "timestamp": timestamp,
        "pubKey": public_key
    }

# move to network    headers = {'content-type': 'application/json'}
    response = post(url='user/create', payload=payload)

    return response


async def getUserByUUID(uuid):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}'
    signature = await sessionless.sign(message.encode('ascii'), get_key)

    response = get(url=f'user/{uuid}?timestamp={timestamp}&signature={signature}')


async def getUserByPubKey(public_key):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{public_key}'
    signature = await sessionless.sign(message.encode('ascii'), get_key)

    response = get(url=f'user/pubKey/{public_key}?timestamp={timestamp}&signature={signature}')
