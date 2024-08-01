from src.network.network import get, put
from sessionless import SessionlessSecp256k1
import time
import requests

async def register(user, save_keys, get_keys):
    sessionless = SessionlessSecp256k1()
    private_key, public_key = sessionless.generateKeys(save_keys)

    print(user)

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{public_key}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    payload = {
        "timestamp": timestamp,
        "pubKey": public_key,
        "signature": signature,
        "user": user
    }

    response = await put('user/create', payload)

    return response


async def get_user_by_uuid(uuid, get_keys):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    response = await get(f'user/{uuid}?timestamp={timestamp}&signature={signature}')

    return response

async def get_user_by_pub_key(public_key, get_keys):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{public_key}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    response = await get(f'user/pubKey/{public_key}?timestamp={timestamp}&signature={signature}')

    return response

async def get_nineum(uuid, get_keys):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    response = await get(f'user/{uuid}/nineum?timestamp={timestamp}&signature={signature}')

    return response
