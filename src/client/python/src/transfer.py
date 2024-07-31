from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time

async def transferNineum(uuid, destnationUUID, nineumUniqueIds, price, currency):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}{destinationUUID}{nineumUniqueIds.join('')}{price}{currency}'
    signature = await sessionless.sign(message.encode('ascii'), get_key)

    payload = {
        "timestamp": timestamp,
        "uuid": uuid,
        "destinationUUID": destinationUUID,
        "nineumUniqueIds": nineumUniqueIds,
        "price": price,
        "currency": currency,
        "signature": signature
    }

    response = post(url=f'user/{uuid}/transfer', payload=payload)

    return response
