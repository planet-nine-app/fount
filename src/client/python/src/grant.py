from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time

async def grant(uuid, destinationUUID, amount, description, get_keys):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}{destinationUUID}{amount}{description}'
    print(message)
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    payload = {
        "timestamp": timestamp,
        "uuid": uuid,
        "destinationUUID": destinationUUID,
        "amount": amount,
        "description": description,
        "signature": signature
    }

    response = await post(f'user/{uuid}/grant', payload)

    return response
