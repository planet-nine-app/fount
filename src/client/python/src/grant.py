from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time

async def grant(uuid, destnationUUID, amount, description):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}{destinationUUID}{amount}'
    signature = await sessionless.sign(message.encode('ascii'), get_key)

    payload = {
        "timestamp": timestamp,
        "uuid": uuid,
        "destinationUUID": destinationUUID,
        "amount": amount,
        "signature": signature
    }

    response = post(url=f'user/{uuid}/grant', payload=payload)

    return response
